import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import socketService from '../services/socketService'
import styles from './Chat.module.css'
import { useBoard } from '../context/BoardContext'
import { stressMessages } from '../fixtures/chatStress'

const PROJECT_ID = 'board-1'
const idOf = value => String(value?.id ?? value?._id ?? value ?? '')
const senderOf = message => message.sender?.username || message.senderUsername || message.username || 'Team member'
const senderIdOf = message => idOf(message.sender?.id ?? message.sender?._id ?? message.senderId ?? message.userId ?? message.sender)
const timeOf = message => message.createdAt || message.timestamp
const mergeMessage = (items, message) => items.some(item => idOf(item) === idOf(message)) ? items : [...items, message]

export default function Chat() {
  const { user, goToBoard } = useAuth()
  const { board } = useBoard()
  const tasks = board.columns.flatMap(column => column.tasks)
  const preview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('chatPreview') === 'stress'
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
  const [contextMessageId, setContextMessageId] = useState(null)
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

  useEffect(() => {
    if (activeMode !== 'team' || !contextMessageId) return
    const target = document.getElementById(`message-${contextMessageId}`)
    target?.scrollIntoView({ block: 'center' })
    target?.focus({ preventScroll: true })
  }, [activeMode, contextMessageId])

  const openContext = (event, messageId) => {
    event.preventDefault()
    if (!teamMessages.some(message => idOf(message) === messageId)) { setError('The original message is no longer available in the loaded conversation.'); return }
    setError(''); setContextMessageId(messageId); setActiveMode('team')
  }

  const messages = selectedUser ? directMessages[idOf(selectedUser)] || [] : []
  const saveDecision = message => { const next = [{ id: crypto.randomUUID(), sourceMessageId: idOf(message), content: message.content, author: senderOf(message), authorizedBy: user.username, scheduleImpact: 'Unclassified', taskId: '', createdAt: new Date().toISOString(), reason: 'Promoted from team conversation' }, ...decisions]; setDecisions(next); localStorage.setItem('novasync-decisions', JSON.stringify(next)) }
  const updateDecision = (id, patch) => {
    const next = decisions.map(decision => decision.id === id ? { ...decision, ...patch } : decision)
    setDecisions(next); localStorage.setItem('novasync-decisions', JSON.stringify(next))
  }
  const openTimeline = () => { sessionStorage.setItem('novasync-board-view', 'timeline'); goToBoard() }
  return <div className={styles.chatContainer}>
    <header className={styles.header}><div className={styles.headerLeft}><span className={styles.kicker}>WORKSPACE</span><h1>Collaboration Hub</h1><p className={styles.subtitle}>One place for conversations, context and decisions.</p></div></header>
    <main className={styles.hubShell}>
      <div className={styles.hubTop}><span className={styles.hubTitle}>Team workspace</span><nav className={styles.modeToggle} aria-label="Collaboration views">{[['team','# Team chat'],['direct','Direct'],['decisions','Decisions']].map(([mode,label]) => <button key={mode} aria-pressed={activeMode === mode} className={`${styles.modeBtn} ${activeMode === mode ? styles.active : ''}`} onClick={() => setActiveMode(mode)}>{label}{mode === 'decisions' && <i>{decisions.length}</i>}</button>)}</nav></div>
      <div className={styles.hubGrid}>
        <aside className={styles.usersSidebar} aria-label="Chat navigation">
          <h2>CHANNELS</h2>
          <button className={`${styles.userOption} ${activeMode === 'team' ? styles.selected : ''}`} aria-pressed={activeMode === 'team'} onClick={() => setActiveMode('team')}><span className={styles.navSymbol}>#</span><span className={styles.userInfo}><span className={styles.userName}>Team chat</span><small>Everyone in the workspace</small></span></button>
          <h2 className={styles.navHeading}>DIRECT MESSAGES</h2>
          <div className={styles.usersList}>{members.map(member => <button type="button" key={idOf(member)} className={`${styles.userOption} ${activeMode === 'direct' && idOf(selectedUser) === idOf(member) ? styles.selected : ''}`} aria-pressed={activeMode === 'direct' && idOf(selectedUser) === idOf(member)} onClick={() => { setActiveMode('direct'); selectMember(member) }}><span className={styles.userIcon}><Presence online={onlineUsers.has(idOf(member))}/>{member.username.charAt(0).toUpperCase()}</span><span className={styles.userInfo}><span className={styles.userName}>{member.username}</span></span></button>)}{!members.length && <p className={styles.navHint}>{loading ? 'Loading members…' : 'No other members yet.'}</p>}</div>
          <h2 className={styles.navHeading}>REPOSITORY</h2>
          <button className={`${styles.userOption} ${activeMode === 'decisions' ? styles.selected : ''}`} aria-pressed={activeMode === 'decisions'} onClick={() => setActiveMode('decisions')}><Bookmark/><span className={styles.userInfo}><span className={styles.userName}>Decision log</span><small>{decisions.length} saved records</small></span></button>
          <button className={styles.timelineNav} onClick={openTimeline}>Open project timeline ↗</button>
        </aside>
        <section className={styles.hubContent} aria-label="Active conversation">
          {error && <div className={styles.chatError} role="alert">{error}</div>}
          {activeMode === 'team' ? <div className={styles.teamChat}>
            <div className={styles.chatTop}><h2># Team chat</h2><p className={styles.modeInfo}>{preview ? 'Layout preview · sample messages only' : 'Visible to everyone in this workspace · mention tasks with #NS-101'}</p></div>
            <MessageList messages={preview ? stressMessages : teamMessages} userId={currentUserId} loading={!preview && loading} typingUser={typingUser} onDecision={!preview && user?.role === 'Admin' ? saveDecision : undefined}/>
            {preview ? <div className={styles.messageForm}>Sample data preview — sending is disabled.</div> : <MessageForm value={messageContent} setValue={setMessageContent} onSubmit={send} sending={sending} placeholder="Message the whole team…" user={user}/>}
          </div> : activeMode === 'direct' ? <section className={styles.chatArea}>{selectedUser ? <><div className={styles.chatAreaHeader}><div className={styles.headerInfo}><span className={styles.userIcon}>{selectedUser.username.charAt(0).toUpperCase()}<Presence online={onlineUsers.has(idOf(selectedUser))}/></span><h2>{selectedUser.username}</h2></div></div><MessageList messages={messages} userId={currentUserId} typingUser={typingUser}/><MessageForm value={messageContent} setValue={setMessageContent} onSubmit={send} sending={sending} placeholder={`Message ${selectedUser.username}…`} user={user}/></> : <div className={styles.emptyState}><p>Select a team member to start a private conversation.</p></div>}</section> : <DecisionLog decisions={decisions} tasks={tasks} canEdit={user?.role === 'Admin'} onUpdate={updateDecision} onTimeline={openTimeline} onContext={openContext} onRemove={id => { const next = decisions.filter(d => d.id !== id); setDecisions(next); localStorage.setItem('novasync-decisions', JSON.stringify(next)) }}/>}
        </section>
      </div>
    </main>
  </div>
}

function MessageList({ messages, userId, loading, typingUser, onDecision }) { return <div className={styles.messageListContainer}><div className={styles.messageList}>{loading ? <div className={styles.emptyState}>Loading messages…</div> : messages.length === 0 ? <div className={styles.emptyState}><p>No messages yet. Start the conversation.</p></div> : messages.map(message => <Message key={idOf(message)} message={message} own={senderIdOf(message)===userId} onDecision={onDecision}/>)}{typingUser && <div className={styles.typingIndicator}>{typingUser} is typing<span>•••</span></div>}</div></div> }
function Message({ message, own, onDecision }) {
  const [reaction, setReaction] = useState('')
  const system = message.type === 'system' || message.type === 'alert'
  return <article id={`message-${idOf(message)}`} tabIndex={-1} className={`${styles.message} ${own ? styles.ownMessage : ''} ${system ? styles.systemMessage : ''}`}>
    <span className={styles.messageAvatar} aria-hidden="true">{system ? '⚠' : senderOf(message).charAt(0).toUpperCase()}</span>
    <div className={styles.messageStack}>
      <div className={styles.messageHeader}><strong className={styles.sender}>{system ? `System · ${senderOf(message)}` : senderOf(message)}</strong><time className={styles.time}>{timeOf(message) ? new Date(timeOf(message)).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}</time></div>
      <div className={styles.messageContent}>
        {system && <span className={styles.alertLabel}>⚠ {message.severity === 'critical' ? 'Critical alert' : 'System notification'}</span>}
        <div className={styles.messageBody}>{message.content}</div>
        {message.attachments?.length > 0 && <ul className={styles.attachments}>{message.attachments.map((file, index) => <li key={file.id || index}><span aria-hidden="true">▤</span><div><strong>{file.name}</strong><small>{file.sizeLabel || 'File attachment'}</small></div>{/^https?:\/\//i.test(file.url || '') && <a href={file.url} target="_blank" rel="noreferrer" aria-label={`Open ${file.name}`}>Open ↗</a>}</li>)}</ul>}
        <div className={styles.messageTools}><button aria-label="Acknowledge message" aria-pressed={Boolean(reaction)} onClick={() => setReaction(reaction ? '' : '✓')}>{reaction || '♡'} {reaction && '1'}</button>{onDecision && <button onClick={() => onDecision(message)}>◇ Save decision</button>}</div>
      </div>
    </div>
  </article>
}
function Presence({ online }) { return <i role="img" aria-label={online ? 'Online' : 'Offline'} title={online ? 'Online' : 'Offline'} className={`${styles.statusDot} ${online ? styles.online : styles.offline}`}/> }
function Bookmark() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z"/></svg> }
function DecisionLog({ decisions, tasks, canEdit, onUpdate, onTimeline, onRemove, onContext }) {
  return <section className={styles.decisionLog}>
    <div className={styles.chatTop}><h2>Decision log</h2><p className={styles.modeInfo}>Important choices preserved outside the chat stream.</p></div>
    <div className={styles.decisionList}>
      {decisions.length ? decisions.map(d => <article key={d.id} className={styles.decisionCard}>
        <div className={styles.decisionCardHeader}><span><Bookmark/> DECISION</span>{canEdit && <button aria-label="Remove saved decision" title="Remove saved decision" onClick={() => onRemove(d.id)}>×</button>}</div>
        <h3>{d.content}</h3>
        <dl className={styles.decisionMeta}><div><dt>{d.authorizedBy ? 'Authorized by' : 'Message author'}</dt><dd>{d.authorizedBy || d.author}</dd></div><div><dt>Recorded</dt><dd><time dateTime={d.createdAt}>{new Date(d.createdAt).toLocaleString([], {month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'})}</time></dd></div></dl>
        <div className={styles.scheduleTags}><span>◷ {d.scheduleImpact || 'Unclassified'}</span>{d.taskId && <span>↗ {tasks.find(task => idOf(task) === d.taskId)?.title || 'Linked task unavailable'}</span>}</div>
        {canEdit && <div className={styles.decisionControls}><label>Schedule impact<select value={d.scheduleImpact || 'Unclassified'} onChange={event => onUpdate(d.id, { scheduleImpact: event.target.value })}>{['Unclassified','Milestone','Schedule change','Critical path review','No schedule impact'].map(label => <option key={label}>{label}</option>)}</select></label><label>Linked task<select value={d.taskId || ''} onChange={event => onUpdate(d.id, { taskId: event.target.value })}><option value="">No linked task</option>{d.taskId && !tasks.some(task => idOf(task) === d.taskId) && <option value={d.taskId}>Linked task unavailable</option>}{tasks.map(task => <option key={idOf(task)} value={idOf(task)}>{task.title}</option>)}</select></label></div>}
        <button className={styles.timelineLink} onClick={onTimeline}>Open project timeline ↗</button>
        <footer>{d.sourceMessageId ? <a href={`#message-${d.sourceMessageId}`} onClick={event => onContext(event, d.sourceMessageId)}>View original conversation ↗</a> : <small>Original context unavailable for this older record</small>}</footer>
      </article>) : <div className={styles.decisionEmpty}><Bookmark/><h3>No decisions recorded yet</h3><p>Save an important team message to create your first decision.</p><small>Admins can choose “Save decision” on a message in Team chat.</small></div>}
    </div>
  </section>
}
function MessageForm({ value, setValue, onSubmit, sending, placeholder, user }) { return <form onSubmit={onSubmit} className={styles.messageForm}><input aria-label={placeholder} maxLength="2000" type="text" placeholder={placeholder} value={value} onChange={event => { setValue(event.target.value); socketService.emitTyping(user.id, user.username, PROJECT_ID) }} className={styles.messageInput}/><button type="submit" className={styles.sendBtn} disabled={!value.trim() || sending}>{sending ? 'Sending…' : 'Send'}</button></form> }
