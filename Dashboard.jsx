import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import styles from './Dashboard.module.css'

const paths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  board: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 8v8M15 8v5"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>, check: <path d="M20 6L9 17l-5-5"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  layers: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></>, plus: <path d="M12 5v14M5 12h14"/>,
}
function Icon({ name, size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg> }

export default function Dashboard() {
  const { user, logout, goToBoard, goToTeam, goToReports, goToChat, goToAdmin } = useAuth()
  const { board } = useBoard()
  const columns = board?.columns || []
  const total = columns.reduce((sum, col) => sum + col.tasks.length, 0)
  const isDone = title => /done|complete|deployed|production/i.test(title)
  const isDoing = title => /doing|progress|development/i.test(title)
  const done = columns.filter(c => isDone(c.title)).reduce((sum, c) => sum + c.tasks.length, 0)
  const doing = columns.filter(c => isDoing(c.title) && !isDone(c.title)).reduce((sum, c) => sum + c.tasks.length, 0)
  const todo = Math.max(0, total - done - doing)
  const percent = total ? Math.round(done / total * 100) : 0
  const tasks = columns.flatMap(column => column.tasks.map(task => ({ ...task, columnTitle: column.title }))).slice(0, 4)
  const firstName = user?.username?.split(/[ _-]/)[0] || 'there'
  const initials = (user?.username || 'NS').split(/[ _-]/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const tilt = event => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5
    event.currentTarget.style.setProperty('--rx', `${-y * 4}deg`); event.currentTarget.style.setProperty('--ry', `${x * 5}deg`)
  }
  const resetTilt = event => { event.currentTarget.style.setProperty('--rx', '0deg'); event.currentTarget.style.setProperty('--ry', '0deg') }
  const mouseGlow = event => { const r = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--mouse-x', `${event.clientX-r.left}px`); event.currentTarget.style.setProperty('--mouse-y', `${event.clientY-r.top}px`) }
  const nav = [['grid','Overview',null,true],['board','My board',goToBoard],['users','Team',goToTeam],['message','Messages',goToChat],...(user?.role === 'Admin' ? [['chart','Reports',goToReports],['users','Admin',goToAdmin]] : [])]
  const stats = [
    {label:'Total tasks',value:total,note:'Across this sprint',icon:'layers',tone:'violet'},
    {label:'In progress',value:doing,note:'Currently moving',icon:'clock',tone:'orange'},
    {label:'Completed',value:done,note:`${percent}% completion rate`,icon:'check',tone:'green'},
    {label:'To do',value:todo,note:'Ready to be picked up',icon:'board',tone:'blue'}]
  return <div className={styles.shell} onPointerMove={mouseGlow}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span className={styles.brandMark}><i/><i/><i/></span><span>Nova<b>Sync</b></span></div>
      <nav className={styles.nav} aria-label="Main navigation"><p>Workspace</p>{nav.map(([icon,label,action,active]) => <button key={label} className={active?styles.navActive:''} onClick={action||undefined}><Icon name={icon}/><span>{label}</span>{label==='Messages'&&<i>3</i>}</button>)}</nav>
      <div className={styles.sidebarBottom}><div className={styles.sideProfile}><span className={styles.avatar}>{initials}</span><span><strong>{user?.username}</strong><small>{user?.role||'Member'}</small></span></div><button className={styles.logout} onClick={logout}><Icon name="logout"/><span>Sign out</span></button></div>
    </aside>
    <main className={styles.main}>
      <header className={styles.topbar}><div><p>{today}</p><h1>Good to see you, {firstName}.</h1></div><button className={styles.newTask} onClick={goToBoard}><Icon name="plus" size={18}/> New task</button></header>
      <section className={styles.hero} onPointerMove={tilt} onPointerLeave={resetTilt}><div className={styles.heroGlow}/><div className={styles.heroContent}><span className={styles.eyebrow}><i/> Your workspace is up to date</span><h2>Turn ideas into<br/><em>momentum.</em></h2><p>Keep your team aligned, move work forward, and make every sprint count.</p><button onClick={goToBoard}>Open project board <Icon name="arrow" size={18}/></button></div><div className={styles.orbit} aria-hidden="true"><div className={styles.orbitOuter}><span/><span/></div><div className={styles.orbitInner}><span/></div><div className={styles.orbitCore}><strong>{percent}%</strong><small>complete</small></div></div></section>
      <section className={styles.statsGrid} aria-label="Project statistics">{stats.map((stat,index)=><article className={`${styles.statCard} ${styles[stat.tone]}`} key={stat.label} onPointerMove={tilt} onPointerLeave={resetTilt} style={{'--delay':`${index*60}ms`}}><div className={styles.statIcon}><Icon name={stat.icon}/></div><span>{stat.label}</span><strong>{String(stat.value).padStart(2,'0')}</strong><small>{stat.note}</small></article>)}</section>
      <section className={styles.lowerGrid}>
        <article className={styles.tasksPanel}><div className={styles.panelHeader}><div><span>Live board</span><h3>Recent tasks</h3></div><button onClick={goToBoard}>View all <Icon name="arrow" size={15}/></button></div><div className={styles.taskList}>{tasks.length?tasks.map((task,index)=><button className={styles.taskRow} onClick={goToBoard} key={task.id||`${task.title}-${index}`}><span className={styles.taskCheck}><Icon name={isDone(task.columnTitle)?'check':'clock'} size={15}/></span><span className={styles.taskName}><strong>{task.title}</strong><small>{task.assignee||'Unassigned'}</small></span><span className={`${styles.status} ${isDone(task.columnTitle)?styles.statusDone:isDoing(task.columnTitle)?styles.statusDoing:styles.statusTodo}`}>{isDone(task.columnTitle)?'Done':isDoing(task.columnTitle)?'In progress':'To do'}</span><Icon name="arrow" size={16}/></button>):<div className={styles.emptyState}><Icon name="layers" size={28}/><p>No tasks yet. Start by creating your first one.</p></div>}</div></article>
        <article className={styles.progressPanel}><div className={styles.panelHeader}><div><span>Sprint health</span><h3>Weekly progress</h3></div></div><div className={styles.ring} style={{'--progress':percent}}><div><strong>{percent}%</strong><small>completed</small></div></div><div className={styles.progressLegend}><span><i className={styles.legendDone}/>{done} done</span><span><i className={styles.legendDoing}/>{doing} active</span><span><i className={styles.legendTodo}/>{todo} queued</span></div></article>
      </section>
    </main>
  </div>
}
