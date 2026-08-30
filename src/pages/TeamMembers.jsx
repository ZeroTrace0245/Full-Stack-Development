import React, { useEffect, useState } from 'react'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'
import styles from './TeamMembers.module.css'

const EMPTY_MEMBER = { username: '', email: '', password: '', role: 'Standard User' }
const initials = name => (name || 'TM').split(/[ _-]/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase()

export default function TeamMembers() {
  const { user, goToDashboard, goToChat } = useAuth()
  const [team, setTeam] = useState([])
  const [form, setForm] = useState(EMPTY_MEMBER)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isAdmin = user?.role === 'Admin'

  const loadMembers = async () => {
    setLoading(true); setError('')
    try { const result = await apiClient.getAllUsers(); setTeam(result.users || []) }
    catch (err) { setError(err.error || err.message || 'Could not load team members.') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadMembers() }, [])

  const handleAdd = async event => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const result = await apiClient.createUser(form)
      setTeam(current => [...current, result.user].sort((a, b) => a.username.localeCompare(b.username)))
      setForm(EMPTY_MEMBER)
    } catch (err) { setError(err.error || err.errors?.[0]?.msg || err.message || 'Could not create this member.') }
    finally { setSaving(false) }
  }

  return <div className={styles.container}>
    <header className={styles.header}><div><span className={styles.eyebrow}>WORKSPACE DIRECTORY</span><h1>Team Members</h1><p>{team.length} real account{team.length === 1 ? '' : 's'} connected to this workspace</p></div><div className={styles.headerActions}><button className={styles.messageBtn} onClick={goToChat}>Open messages</button><button className={styles.backBtn} onClick={goToDashboard}>← Back</button></div></header>
    {error && <div className={styles.error} role="alert">{error}</div>}
    {isAdmin && <section className={styles.addForm}><div className={styles.formHeading}><div><span>ADD ACCOUNT</span><h2>Invite a team member</h2></div><small>This creates a real login that can use tasks and messages.</small></div><form onSubmit={handleAdd}>
      <input required type="text" minLength="2" maxLength="50" placeholder="Full name or username" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} className={styles.input}/>
      <input required type="email" placeholder="Email address" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className={styles.input}/>
      <input required type="password" minLength="6" placeholder="Temporary password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className={styles.input}/>
      <select value={form.role} onChange={event => setForm({ ...form, role: event.target.value })} className={styles.input}><option>Standard User</option><option>Admin</option></select>
      <button type="submit" className={styles.btn} disabled={saving}>{saving ? 'Creating…' : 'Add member'}</button>
    </form></section>}
    <section className={styles.directory}><div className={styles.directoryHead}><span>Member</span><span>Role</span><span>Joined</span></div>{loading ? <div className={styles.empty}>Loading real accounts…</div> : team.length === 0 ? <div className={styles.empty}>No team accounts found.</div> : <ul className={styles.list}>{team.map(member => <li key={member.id} className={styles.item}><div className={styles.person}><div className={styles.avatar}>{initials(member.username)}</div><div><strong>{member.username}{member.id === user?.id && <em>You</em>}</strong><small>{member.email}</small></div></div><span className={`${styles.role} ${member.role === 'Admin' ? styles.admin : ''}`}>{member.role}</span><time>{member.createdAt ? new Date(member.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</time></li>)}</ul>}</section>
  </div>
}
