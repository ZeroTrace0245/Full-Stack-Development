import { pageItems } from '../pages/adminPagination'
import { useEffect, useState } from 'react'
import apiClient from '../api/client'
import { Pagination } from './AdminPagination'
import styles from '../pages/AdminPanel.module.css'
const senderName = message => message.sender?.username || message.username || 'Team member'
const sentAt = message => message.createdAt || message.timestamp
export default function AdminTeamMessages({ previewMessages }) {
  const [messages, setMessages] = useState(previewMessages || [])
  const [loading, setLoading] = useState(!previewMessages), [error, setError] = useState('')
  const [query, setQuery] = useState(''), [page, setPage] = useState(0)
  const load = async () => {
    if (previewMessages) return
    setLoading(true); setError('')
    try { const result = await apiClient.getAdminTeamMessages(250); setMessages(result.messages || []); setPage(0) }
    catch (err) { setError(err.error || err.message || 'Could not load team messages.') }
    finally { setLoading(false) }
  }
  useEffect(() => { if (previewMessages) return; let alive = true; apiClient.getAdminTeamMessages(250).then(result => { if (alive) setMessages(result.messages || []) }).catch(err => { if (alive) setError(err.error || err.message || 'Could not load team messages.') }).finally(() => { if (alive) setLoading(false) }); return () => { alive = false } }, [previewMessages])
  const filtered = messages.filter(message => `${senderName(message)} ${message.content} ${message.projectId || ''}`.toLowerCase().includes(query.trim().toLowerCase())).slice().sort((a, b) => (new Date(sentAt(b)).getTime() || 0) - (new Date(sentAt(a)).getTime() || 0))
  const { rows, current, pages } = pageItems(filtered, page)
  return <section className={styles.panel}><header className={styles.sectionHead}><div><span className={styles.eyebrow}>READ-ONLY AUDIT</span><h2>Team message history</h2><p>Workspace posts only · newest first · {previewMessages ? 'sample history' : 'latest 250 messages available from the API'}. Private direct messages are excluded.</p></div><button onClick={load} disabled={loading || Boolean(previewMessages)}>{loading ? 'Loading…' : 'Refresh'}</button></header>
    <div className={styles.filters}><label>Search loaded messages<input type="search" placeholder="Sender, message or project…" value={query} onChange={event => { setQuery(event.target.value); setPage(0) }}/></label></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.tableScroll} tabIndex={0} aria-label="Message audit table"><table className={styles.auditTable}><thead><tr><th scope="col">Timestamp</th><th scope="col">Sender / project</th><th scope="col">Message record</th></tr></thead><tbody>{loading || !rows.length ? <tr><td colSpan={3}>{loading ? 'Loading audit records…' : error ? 'Audit unavailable. Try Refresh.' : 'No matching messages.'}</td></tr> : rows.map(message => <tr key={message.id || message._id}><td><time dateTime={sentAt(message)}>{sentAt(message) ? new Date(sentAt(message)).toLocaleString() : 'Timestamp unavailable'}</time></td><td><strong>{senderName(message)}</strong><small>{message.projectId || 'Workspace'}</small></td><td><p>{message.content}</p><small>Record {message.id || message._id}</small></td></tr>)}</tbody></table></div>
    <Pagination count={filtered.length} page={current} pages={pages} onChange={setPage}/>
  </section>
}
