import React, { useLayoutEffect, useState } from 'react'; import { useAuth } from '../context/AuthContext'; import styles from './WorkspaceNav.module.css'
const paths={grid:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,board:<><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 8v8M15 8v5"/></>,users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,message:<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>,chart:<><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34A1.7 1.7 0 0 0 14 20.92V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15z"/></>,logout:<><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>}
const filled = {
  grid: paths.grid,
  board: <path fillRule="evenodd" d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm2 4h2v10H8V7Zm6 0h2v7h-2V7Z"/>,
  users: <><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2H2Zm16 0v-2a7 7 0 0 0-2-5c4 0 6 2 6 5v2h-4ZM16 3a4 4 0 0 1 0 8 6 6 0 0 0 0-8Z"/></>,
  message: paths.message,
  chart: <><rect x="3" y="9" width="4" height="12" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="17" y="12" width="4" height="9" rx="1"/></>,
  settings: <path fillRule="evenodd" d="m10 2-1 3-2 1-3-1-2 4 2 2v2l-2 2 2 4 3-1 2 1 1 3h4l1-3 2-1 3 1 2-4-2-2v-2l2-2-2-4-3 1-2-1-1-3h-4Zm2 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>,
}
const Icon = ({ name, active = false }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{active ? filled[name] || paths[name] : paths[name]}</svg>
export default function WorkspaceNav() {
  const { user, currentPage, logout, goToDashboard, goToBoard, goToTeam, goToChat, goToReports, goToAdmin, goToSettings } = useAuth()
  const [collapsed, setCollapsed] = useState(() => {
    try { const saved = localStorage.getItem('novasync-nav-collapsed'); if (saved !== null) return saved === 'true' } catch { /* Use viewport default when storage is unavailable. */ }
    return typeof matchMedia !== 'undefined' && matchMedia('(min-width: 761px) and (max-width: 1100px)').matches
  })
  useLayoutEffect(() => {
    document.documentElement.dataset.navCollapsed = String(collapsed)
    try { localStorage.setItem('novasync-nav-collapsed', String(collapsed)) } catch { /* The toggle still works without persistence. */ }
  }, [collapsed])
  const initials = (user?.username || 'NS').split(/[ _-]/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const items = [['dashboard', 'grid', 'Overview', goToDashboard], ['board', 'board', 'My board', goToBoard], ['team', 'users', 'Team', goToTeam], ['chat', 'message', 'Messages', goToChat], ...(user?.role === 'Admin' ? [['reports', 'chart', 'Reports', goToReports], ['admin', 'users', 'Admin', goToAdmin]] : []), ['settings', 'settings', 'Settings', goToSettings]]
  const tooltip = label => <span className={styles.tooltip} aria-hidden="true">{label}</span>
  return <aside className={`${styles.frostedNav} ${collapsed ? styles.collapsed : ''}`} aria-label="Workspace sidebar">
    <button className={styles.brand} onClick={goToDashboard} aria-label="NovaSync overview"><span className={styles.brandMark}><i/><i/><i/></span><span className={styles.brandName}>Nova<b>Sync</b></span></button>
    <nav id="workspace-navigation" className={styles.nav} aria-label="Workspace navigation"><p className={styles.sectionLabel}>Workspace</p>{items.map(([page, icon, label, action]) => <button key={page} className={`${styles.navItem} ${currentPage === page ? styles.active : ''}`} onClick={action} aria-label={label} aria-current={currentPage === page ? 'page' : undefined}><Icon name={icon} active={currentPage === page}/><span className={styles.label}>{label}</span>{tooltip(label)}</button>)}</nav>
    <div className={styles.bottom}>
      <button className={styles.toggle} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} aria-controls="workspace-navigation" onClick={() => setCollapsed(value => !value)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={collapsed ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'}/></svg><span className={styles.label}>Collapse sidebar</span>{tooltip('Expand navigation')}</button>
      <button className={styles.profile} onClick={goToSettings} aria-label={`Account settings for ${user?.username || 'your account'}`}>{user?.avatar ? <img className={styles.avatar} src={user.avatar} alt=""/> : <span className={styles.avatar}>{initials}</span>}<span className={styles.profileText}><strong>{user?.username}</strong><small>{user?.role || 'Member'}</small></span>{tooltip(`${user?.username || 'Profile'} · Settings`)}</button>
      <button className={styles.logout} onClick={logout} aria-label="Sign out"><Icon name="logout"/><span className={styles.label}>Sign out</span>{tooltip('Sign out')}</button>
    </div>
  </aside>
}
