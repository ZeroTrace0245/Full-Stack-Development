import React, { useEffect, useState } from 'react'
import apiClient from '../api/client'

const senderName = message => message.sender?.username || message.username || 'Team member'
const sentAt = message => message.createdAt || message.timestamp

export default function AdminTeamMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { const result = await apiClient.getAdminTeamMessages(); setMessages(result.messages || []) }
    catch (err) { setError(err.error || err.message || 'Could not load team messages.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return <section className="adminTeamMessages">
    <div className="adminMessagesHead"><div><span>TEAM COMMUNICATION</span><h2>Team messages</h2><p>Workspace-wide posts only. Private direct messages are not shown.</p></div><button type="button" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button></div>
    {error ? <div className="adminMessagesError">{error}</div> : loading ? <div className="adminEmpty">Loading team messages…</div> : messages.length === 0 ? <div className="adminEmpty">No team messages have been posted yet.</div> : <div className="adminMessageList">{[...messages].reverse().map(message => <article key={message.id || message._id}><span className="adminMessageAvatar">{senderName(message).slice(0, 2).toUpperCase()}</span><div><header><strong>{senderName(message)}</strong><time>{sentAt(message) ? new Date(sentAt(message)).toLocaleString() : ''}</time></header><p>{message.content}</p><small>Project: {message.projectId || 'Workspace'}</small></div></article>)}</div>}
  </section>
}
