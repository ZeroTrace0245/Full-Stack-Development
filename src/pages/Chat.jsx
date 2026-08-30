import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import socketService from '../services/socketService'
import styles from './Chat.module.css'

const PROJECT_ID = 'board-1'
const idOf = value => String(value?.id ?? value?._id ?? value ?? '')
const senderOf = message => message.sender?.username || message.senderUsername || message.username || 'Team member'
const senderIdOf = message => idOf(message.sender?.id ?? message.sender?._id ?? message.senderId ?? message.userId ?? message.sender)
const timeOf = message => message.createdAt || message.timestamp
const mergeMessage = (items, message) => items.some(item => idOf(item) === idOf(message)) ? items : [...items, message]

export default function Chat() {
  const { user, goToDashboard } = useAuth()
  const [activeMode, setActiveMode] = useState('team')
  const [teamMessages, setTeamMessages] = useState([])
  const [directMessages, setDirectMessages] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [messageContent, setMessageContent] = useState('')
  const [typingUser, setTypingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const typingTimer = useRef(null)
  const currentUserId = idOf(user)
  const members = useMemo(() => allUsers.filter(member => idOf(member) !== currentUserId), [allUsers, currentUserId])

  useEffect(() => {
    let active = true
    Promise.all([apiClient.getAllUsers(), apiClient.getTeamMessages(PROJECT_ID)]).then(([usersResult, messagesResult]) => {
      if (active) { setAllUsers(usersResult.users || []); setTeamMessages(messagesResult.messages || []) }
    }).catch(err => active && setError(err.error || err.message || 'Could not load messages.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!user) return
    socketService.connect(user.id, user.username)
    const onTeam = message => { if (String(message.projectId) === PROJECT_ID) setTeamMessages(items => mergeMessage(items, message)) }
    const onDirect = message => {
      const conversationId = senderIdOf(message) === currentUserId ? idOf(message.receiverId || message.receiver) : senderIdOf(message)
      setDirectMessages(current => ({ ...current, [conversationId]: mergeMessage(current[conversationId] || [], message) }))
    }
    const onOnline = data => setOnlineUsers(current => new Set(current).add(idOf(data.userId)))
    const onOffline = data => setOnlineUsers(current => { const next = new Set(current); next.delete(idOf(data.userId)); return next })
    const onTyping = data => { if (idOf(data.userId) !== currentUserId) { setTypingUser(data.username); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTypingUser(null), 2500) } }
    socketService.on('message:team:received', onTeam); socketService.on('message:direct:received', onDirect); socketService.on('user:online', onOnline); socketService.on('user:offline', onOffline); socketService.on('user:typing:indicator', onTyping)
    return () => { clearTimeout(typingTimer.current); socketService.off('message:team:received', onTeam); socketService.off('message:direct:received', onDirect); socketService.off('user:online', onOnline); socketService.off('user:offline', onOffline); socketService.off('user:typing:indicator', onTyping) }
  }, [user, currentUserId])

  const selectMember = async member => {
    setSelectedUser(member); setError('')
    const memberId = idOf(member)
    if (directMessages[memberId]) return
    try { const result = await apiClient.getDirectMessages(memberId); setDirectMessages(current => ({ ...current, [memberId]: result.messages || [] })) }
    catch (err) { setError(err.error || err.message || 'Could not load this conversation.') }
  }

  const send = async event => {
    event.preventDefault()
    const content = messageContent.trim()
    if (!content || sending || (activeMode === 'direct' && !selectedUser)) return
    setSending(true); setError('')
    try {
      if (activeMode === 'team') { const { message } = await apiClient.sendTeamMessage(PROJECT_ID, content); setTeamMessages(items => mergeMessage(items, message)) }
      else { const memberId = idOf(selectedUser); const { message } = await apiClient.sendDirectMessage(memberId, content); setDirectMessages(current => ({ ...current, [memberId]: mergeMessage(current[memberId] || [], message) })) }
      setMessageContent('')
    } catch (err) { setError(err.error || err.message || 'Message could not be sent.') }
    finally { setSending(false) }
  }

  const messages = selectedUser ? directMessages[idOf(selectedUser)] || [] : []
  return <div className={styles.chatContainer}>
    <header className={styles.header}><div className={styles.headerLeft}><h1>Messages</h1><p className={styles.subtitle}>Team chat and private conversations</p></div><button className={styles.backBtn} onClick={goToDashboard}>← Back to Dashboard</button></header>
    <main className={styles.main}>{error && <div className={styles.chatError} role="alert">{error}</div>}{activeMode === 'team' ? <div className={styles.teamChat}><div className={styles.chatTop}><h2>Team chat</h2><p className={styles.modeInfo}>Visible to everyone in this workspace</p></div><MessageList messages={teamMessages} userId={currentUserId} loading={loading} typingUser={typingUser}/><MessageForm value={messageContent} setValue={setMessageContent} onSubmit={send} sending={sending} placeholder="Message the whole team…" user={user}/></div> : <div className={styles.directMessagesContainer}>
      <aside className={styles.usersSidebar}><h2>Direct messages</h2><div className={styles.usersList}>{members.map(member => <button type="button" key={idOf(member)} className={`${styles.userOption} ${idOf(selectedUser) === idOf(member) ? styles.selected : ''}`} onClick={() => selectMember(member)}><span className={styles.userIcon}><i className={`${styles.statusDot} ${onlineUsers.has(idOf(member)) ? styles.online : styles.offline}`}/>{member.username.charAt(0).toUpperCase()}</span><span className={styles.userInfo}><span className={styles.userName}>{member.username}</span><span className={styles.userStatus}>{onlineUsers.has(idOf(member)) ? 'Online' : 'Offline'}</span></span></button>)}</div></aside>
      <section className={styles.chatArea}>{selectedUser ? <><div className={styles.chatAreaHeader}><div className={styles.headerInfo}><h2>{selectedUser.username}</h2><span className={`${styles.onlineStatus} ${onlineUsers.has(idOf(selectedUser)) ? styles.online : styles.offline}`}>{onlineUsers.has(idOf(selectedUser)) ? 'Online' : 'Offline'}</span></div></div><MessageList messages={messages} userId={currentUserId} typingUser={typingUser}/><MessageForm value={messageContent} setValue={setMessageContent} onSubmit={send} sending={sending} placeholder={`Message ${selectedUser.username}…`} user={user}/></> : <div className={styles.emptyState}><p>Select a team member to start a private conversation.</p></div>}</section>
    </div>}</main>
    <div className={styles.modeToggle}><button className={`${styles.modeBtn} ${activeMode === 'team' ? styles.active : ''}`} onClick={() => setActiveMode('team')}>Team chat</button><button className={`${styles.modeBtn} ${activeMode === 'direct' ? styles.active : ''}`} onClick={() => setActiveMode('direct')}>Direct messages</button></div>
  </div>
}

function MessageList({ messages, userId, loading, typingUser }) { return <div className={styles.messageListContainer}><div className={styles.messageList}>{loading ? <div className={styles.emptyState}>Loading messages…</div> : messages.length === 0 ? <div className={styles.emptyState}><p>No messages yet. Start the conversation.</p></div> : messages.map(message => <article key={idOf(message)} className={`${styles.message} ${senderIdOf(message) === userId ? styles.ownMessage : ''}`}><div className={styles.messageHeader}><strong className={styles.sender}>{senderOf(message)}</strong><time className={styles.time}>{timeOf(message) ? new Date(timeOf(message)).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</time></div><div className={styles.messageBody}>{message.content}</div></article>)}{typingUser && <div className={styles.typingIndicator}>{typingUser} is typing…</div>}</div></div> }
function MessageForm({ value, setValue, onSubmit, sending, placeholder, user }) { return <form onSubmit={onSubmit} className={styles.messageForm}><input maxLength="2000" type="text" placeholder={placeholder} value={value} onChange={event => { setValue(event.target.value); socketService.emitTyping(user.id, user.username, PROJECT_ID) }} className={styles.messageInput}/><button type="submit" className={styles.sendBtn} disabled={!value.trim() || sending}>{sending ? 'Sending…' : 'Send'}</button></form> }
