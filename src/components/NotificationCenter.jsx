import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import styles from './NotificationCenter.module.css'

const emptyForm = { type: 'news', title: '', message: '', meetingAt: '' }

export default function NotificationCenter() {
  const { user, isLoggedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const [atlas, setAtlas] = useState({ checked: false, configured: false, connected: false })
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [lastHealthy, setLastHealthy] = useState(null)
  const [feedError, setFeedError] = useState(false)
  const rootRef = useRef(null)
  const bellRef = useRef(null)
  const requestRef = useRef(0)

  const refresh = useCallback(async () => {
    if (!isLoggedIn) return
    const request = ++requestRef.current
    setChecking(true)
    const [health, feed] = await Promise.allSettled([apiClient.getSystemStatus(), apiClient.getNotifications()])
    if (request !== requestRef.current) return
    setChecking(false)
    if (health.status === 'fulfilled') setAtlas({ checked: true, ...health.value.atlas })
    else setAtlas({ checked: true, configured: true, connected: false })
    if (health.status === 'fulfilled' && health.value.atlas?.connected) setLastHealthy(new Date())
    if (feed.status === 'fulfilled') setItems(feed.value.notifications)
    setFeedError(feed.status === 'rejected')
  }, [isLoggedIn])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => { clearInterval(interval); requestRef.current += 1 }
  }, [refresh])

  useEffect(() => {
    if (!isLoggedIn) { setOpen(false); setItems([]); setLastHealthy(null); setAtlas({ checked: false, configured: false, connected: false }); setFeedError(false) }
  }, [isLoggedIn])

  useEffect(() => {
    if (!open) return
    const dismiss = event => { if (!rootRef.current?.contains(event.target)) setOpen(false) }
    const escape = event => { if (event.key === 'Escape') { setOpen(false); bellRef.current?.focus() } }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [open])

  if (!isLoggedIn) return null
  const unread = items.filter(item => !(item.readBy || []).includes(String(user.id))).length
  const atlasLabel = checking || !atlas.checked ? 'Checking Atlas' : atlas.connected ? 'Atlas connected' : atlas.configured ? 'Atlas disconnected' : 'Local only'
  const connectionStyle = checking || !atlas.checked ? styles.syncing : atlas.connected ? styles.online : atlas.configured ? styles.offline : styles.syncing

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (!next) return
    const unreadItems = items.filter(item => !(item.readBy || []).includes(String(user.id)))
    setItems(current => current.map(item => ({ ...item, readBy: [...new Set([...(item.readBy || []), String(user.id)])] })))
    await Promise.allSettled(unreadItems.map(item => apiClient.markNotificationRead(item.id)))
  }

  const post = async event => {
    event.preventDefault(); setPosting(true); setError('')
    try { const result = await apiClient.createNotification(form); setItems(current => [result.notification, ...current]); setForm(emptyForm) }
    catch (err) { setError(err.error || err.errors?.[0]?.msg || err.message || 'Could not post announcement') }
    finally { setPosting(false) }
  }

  const remove = async id => {
    try { await apiClient.deleteNotification(id); setItems(current => current.filter(item => item.id !== id)) }
    catch (err) { setError(err.error || err.message || 'Could not delete notification') }
  }

  return <div className={styles.root} ref={rootRef}>
    <div className={styles.controls}>
      <span className={styles.connection}>
        <button type="button" className={styles.atlas} aria-label={atlasLabel} aria-describedby="atlas-details" onClick={refresh} disabled={checking}><i className={connectionStyle}/><span>{atlasLabel}</span></button>
        <span className={styles.tooltip} id="atlas-details" role="tooltip"><strong>{atlasLabel}</strong><span>{lastHealthy ? `Last confirmed healthy: ${lastHealthy.toLocaleTimeString()}` : 'No healthy connection confirmed yet.'}</span><small>{checking ? 'Checking cloud connection…' : atlas.connected ? 'Health checked every 15 seconds. Click to refresh.' : atlas.configured ? 'Cloud connection unavailable. Retrying automatically.' : 'Atlas is not configured; using local storage.'}</small></span>
      </span>
      <button ref={bellRef} className={styles.bell} type="button" onClick={toggle} aria-controls="notification-popover" aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
        {unread > 0 && <b>{unread > 99 ? '99+' : unread}</b>}
      </button>
    </div>
    {open && <section id="notification-popover" className={styles.panel} aria-label="Notification center">
      <div className={styles.panelBody}>
      <header><div><small>Workspace</small><h2>Notifications</h2></div><button onClick={() => { setOpen(false); bellRef.current?.focus() }} aria-label="Close notifications">×</button></header>
      {user.role === 'Admin' && <form className={styles.composer} onSubmit={post}>
        <div><select aria-label="Announcement type" value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value }))}><option value="news">News</option><option value="meeting">Meeting</option><option value="important">Important</option></select><input aria-label="Announcement title" required maxLength="120" placeholder="Announcement title" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))}/></div>
        <textarea aria-label="Announcement message" required maxLength="1000" placeholder="Share an update with the team…" value={form.message} onChange={e => setForm(v => ({ ...v, message: e.target.value }))}/>
        {form.type === 'meeting' && <input aria-label="Meeting date and time" type="datetime-local" value={form.meetingAt} onChange={e => setForm(v => ({ ...v, meetingAt: e.target.value }))}/>}
        <button disabled={posting}>{posting ? 'Posting…' : 'Post to everyone'}</button>
      </form>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {feedError && <p className={styles.error} role="status">Unable to refresh notifications. Retrying automatically.</p>}
      <div className={styles.feed}>{items.length === 0 ? <div className={styles.empty}><span aria-hidden="true">{feedError ? '!' : checking ? '…' : '✓'}</span><h3>{feedError ? 'Updates unavailable' : checking ? 'Checking for updates…' : "You're all caught up!"}</h3><p>{feedError ? 'Your notifications will appear when the connection returns.' : 'Admin alerts and team meetings will appear here.'}</p></div> : items.map(item => <article key={item.id}>
        <span className={`${styles.kind} ${styles[item.type] || ''}`}>{({ assignment: 'Task', important: 'Admin alert', meeting: 'Team meeting', news: 'News' })[item.type] || 'Update'}</span>
        <div><h3>{item.title}</h3><p>{item.message}</p>{item.meetingAt && <time>Meeting: {new Date(item.meetingAt).toLocaleString()}</time>}<small>{item.createdByName || 'NovaSync'} • {new Date(item.createdAt).toLocaleString()}</small></div>
        {user.role === 'Admin' && <button className={styles.delete} onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}>×</button>}
      </article>)}</div>
      </div>
    </section>}
  </div>
}
