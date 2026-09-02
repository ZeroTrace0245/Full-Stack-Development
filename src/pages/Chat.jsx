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
  const { user } = useAuth()
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
  const [decisions, setDecisions] = useState(() => { try { return JSON.parse(localStorage.getItem('novasync-decisions') || '[]') } catch { return [] } })
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
  const saveDecision = message => { const next = [{ id: crypto.randomUUID(), content: message.content, author: senderOf(message), createdAt: new Date().toISOString(), reason: 'Promoted from team conversation' }, ...decisions]; setDecisions(next); localStorage.setItem('novasync-decisions', JSON.stringify(next)) }
  return <div className={styles.chatContainer}>
    <header className={styles.header}><div className={styles.headerLeft}><span className={styles.kicker}>COLLABORATION HUB</span><h1>Messages</h1><p className={styles.subtitle}>Conversations, context and permanent decisions.</p></div><div className={styles.modeToggle}><button className={`${styles.modeBtn} ${activeMode==='team'?styles.active:''}`} onClick={()=>setActiveMode('team')}># Team chat</button><button className={`${styles.modeBtn} ${activeMode==='direct'?styles.active:''}`} onClick={()=>setActiveMode('direct')}>Direct</button><button className={`${styles.modeBtn} ${activeMode==='decisions'?styles.active:''}`} onClick={()=>setActiveMode('decisions')}>Decisions <i>{decisions.length}</i></button></div></header>
    <main className={styles.main}>{error && <div className={styles.chatError} role="alert">{error}</div>}{activeMode === 'team' ? <div className={styles.teamChat}><div className={styles.chatTop}><h2># Team chat</h2><p className={styles.modeInfo}>Visible to everyone in this workspace · mention tasks with #NS-101</p></div><MessageList messages={teamMessages} userId={currentUserId} loading={loading} typingUser={typingUser} onDecision={saveDecision}/><MessageForm value={messageContent} setValue={setMessageContent} onSubmit={send} sending={sending} placeholder="Message the whole team…" user={user}/></div> : activeMode === 'direct' ? <div className={styles.directMessagesContainer}>
      <aside className={styles.usersSidebar}><h2>Direct messages</h2><div className={styles.usersList}>{members.map(member => <button type="button" key={idOf(member)} className={`${styles.userOption} ${idOf(selectedUser) === idOf(member) ? styles.selected : ''}`} onClick={() => selectMember(member)}><span className={styles.userIcon}><i className={`${styles.statusDot} ${onlineUsers.has(idOf(member)) ? styles.online : styles.offline}`}/>{member.username.charAt(0).toUpperCase()}</span><span className={styles.userInfo}><span className={styles.userName}>{member.username}</span><span className={styles.userStatus}>{onlineUsers.has(idOf(member)) ? 'Online' : 'Offline'}</span></span></button>)}</div></aside>
      <section className={styles.chatArea}>{selectedUser ? <><div className={styles.chatAreaHeader}><div className={styles.headerInfo}><h2>{selectedUser.username}</h2><span className={`${styles.onlineStatus} ${onlineUsers.has(idOf(selectedUser)) ? styles.online : styles.offline}`}>{onlineUsers.has(idOf(selectedUser)) ? 'Online' : 'Offline'}</span></div></div><MessageList messages={messages} userId={currentUserId} typingUser={typingUser}/><MessageForm value={messageContent} setValue={setMessageContent} onSubmit={send} sending={sending} placeholder={`Message ${selectedUser.username}…`} user={user}/></> : <div className={styles.emptyState}><p>Select a team member to start a private conversation.</p></div>}</section>
    </div> : <DecisionLog decisions={decisions} onRemove={id=>{const next=decisions.filter(d=>d.id!==id);setDecisions(next);localStorage.setItem('novasync-decisions',JSON.stringify(next))}}/>}</main>
  </div>
}

function MessageList({ messages, userId, loading, typingUser, onDecision }) { return <div className={styles.messageListContainer}><div className={styles.messageList}>{loading ? <div className={styles.emptyState}>Loading messages…</div> : messages.length === 0 ? <div className={styles.emptyState}><p>No messages yet. Start the conversation.</p></div> : messages.map(message => <Message key={idOf(message)} message={message} own={senderIdOf(message)===userId} onDecision={onDecision}/>)}{typingUser && <div className={styles.typingIndicator}>{typingUser} is typing<span>•••</span></div>}</div></div> }
function Message({message,own,onDecision}){const [reaction,setReaction]=useState('');return <article className={`${styles.message} ${own?styles.ownMessage:''}`}><span className={styles.messageAvatar}>{senderOf(message).charAt(0).toUpperCase()}</span><div className={styles.messageContent}><div className={styles.messageHeader}><strong className={styles.sender}>{senderOf(message)}</strong><time className={styles.time}>{timeOf(message)?new Date(timeOf(message)).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):''}</time></div><div className={styles.messageBody}>{message.content}</div><div className={styles.messageTools}><button onClick={()=>setReaction(reaction?'':'✓')}>{reaction||'♡'} {reaction&&'1'}</button><button>↩ Reply</button>{onDecision&&<button onClick={()=>onDecision(message)}>◇ Save decision</button>}</div></div></article>}
function DecisionLog({decisions,onRemove}){return <section className={styles.decisionLog}><div className={styles.chatTop}><h2>Decision log</h2><p className={styles.modeInfo}>Important choices preserved outside the chat stream.</p></div><div className={styles.decisionList}>{decisions.length?decisions.map(d=><article key={d.id}><i>◇</i><div><span>DECISION</span><h3>{d.content}</h3><p>{d.reason}</p><small>Decided by {d.author} · {new Date(d.createdAt).toLocaleString()}</small></div><button onClick={()=>onRemove(d.id)}>×</button></article>):<div className={styles.emptyState}>Save an important team message to create your first decision.</div>}</div></section>}
function MessageForm({ value, setValue, onSubmit, sending, placeholder, user }) { return <form onSubmit={onSubmit} className={styles.messageForm}><input maxLength="2000" type="text" placeholder={placeholder} value={value} onChange={event => { setValue(event.target.value); socketService.emitTyping(user.id, user.username, PROJECT_ID) }} className={styles.messageInput}/><button type="submit" className={styles.sendBtn} disabled={!value.trim() || sending}>{sending ? 'Sending…' : 'Send'}</button></form> }
