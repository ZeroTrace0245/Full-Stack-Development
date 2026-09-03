import { useCallback, useEffect, useState } from 'react'
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

  const refresh = useCallback(async () => {
    if (!isLoggedIn) return
    const [health, feed] = await Promise.allSettled([apiClient.getSystemStatus(), apiClient.getNotifications()])
    if (health.status === 'fulfilled') setAtlas({ checked: true, ...health.value.atlas })
    else setAtlas({ checked: true, configured: true, connected: false })
    if (feed.status === 'fulfilled') setItems(feed.value.notifications)
  }, [isLoggedIn])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [refresh])

  if (!isLoggedIn) return null
  const unread = items.filter(item => !(item.readBy || []).includes(String(user.id))).length
  const atlasLabel = !atlas.checked ? 'Checking Atlas' : atlas.connected ? 'Atlas connected' : atlas.configured ? 'Atlas disconnected' : 'Local only'

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

  return <div className={styles.root}>
    <div className={styles.controls}>
      <span className={styles.atlas} title={atlasLabel}><i className={atlas.connected ? styles.online : styles.offline}/>{atlasLabel}</span>
      <button className={styles.bell} type="button" onClick={toggle} aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
        {unread > 0 && <b>{unread > 99 ? '99+' : unread}</b>}
      </button>
    </div>
    {open && <section className={styles.panel} aria-label="Notification center">
      <header><div><small>Workspace</small><h2>Notifications</h2></div><button onClick={() => setOpen(false)} aria-label="Close notifications">×</button></header>
      {user.role === 'Admin' && <form className={styles.composer} onSubmit={post}>
        <div><select value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value }))}><option value="news">News</option><option value="meeting">Meeting</option><option value="important">Important</option></select><input required maxLength="120" placeholder="Announcement title" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))}/></div>
        <textarea required maxLength="1000" placeholder="Share an update with the team…" value={form.message} onChange={e => setForm(v => ({ ...v, message: e.target.value }))}/>
        {form.type === 'meeting' && <input type="datetime-local" value={form.meetingAt} onChange={e => setForm(v => ({ ...v, meetingAt: e.target.value }))}/>}
        <button disabled={posting}>{posting ? 'Posting…' : 'Post to everyone'}</button>
      </form>}
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.feed}>{items.length === 0 ? <p className={styles.empty}>No notifications yet.</p> : items.map(item => <article key={item.id}>
        <span className={`${styles.kind} ${styles[item.type]}`}>{item.type === 'assignment' ? 'Task' : item.type}</span>
        <div><h3>{item.title}</h3><p>{item.message}</p>{item.meetingAt && <time>Meeting: {new Date(item.meetingAt).toLocaleString()}</time>}<small>{item.createdByName || 'NovaSync'} • {new Date(item.createdAt).toLocaleString()}</small></div>
        {user.role === 'Admin' && <button className={styles.delete} onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}>×</button>}
      </article>)}</div>
    </section>}
  </div>
}
