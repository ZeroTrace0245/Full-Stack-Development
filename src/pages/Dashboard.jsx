import React from 'react'
import WorkspaceNav from '../components/WorkspaceNav'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import styles from './Dashboard.module.css'
import { dashboardTasks, isDone, isDoing } from './dashboardData'

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
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A7 7 0 0 0 15 6l-.3-2.6h-4L10.4 6A7 7 0 0 0 8 7.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A7 7 0 0 0 10.4 18l.3 2.6h4L15 18a7 7 0 0 0 1.5-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/></>,
}
function Icon({ name, size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg> }

export default function Dashboard() {
  const { user, goToBoard } = useAuth()
  const { board } = useBoard()
  const columns = board?.columns || []
  const total = columns.reduce((sum, col) => sum + col.tasks.length, 0)
  const done = columns.filter(c => isDone(c.title)).reduce((sum, c) => sum + c.tasks.length, 0)
  const doing = columns.filter(c => isDoing(c.title) && !isDone(c.title)).reduce((sum, c) => sum + c.tasks.length, 0)
  const todo = Math.max(0, total - done - doing)
  const percent = total ? Math.round(done / total * 100) : 0
  const { recent: tasks, scheduled, unscheduled } = dashboardTasks(columns)
  const firstName = user?.username?.split(/[ _-]/)[0] || 'there'
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const mouseGlow = event => { const r = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--mouse-x', `${event.clientX-r.left}px`); event.currentTarget.style.setProperty('--mouse-y', `${event.clientY-r.top}px`) }
  const stats = [
    {label:'Total tasks',value:total,note:'Across your board',icon:'layers',tone:'violet'},
    {label:'In progress',value:doing,note:'Currently moving',icon:'clock',tone:'orange'},
    {label:'Completed',value:done,note:'Finished and delivered',icon:'check',tone:'green'},
    {label:'To do',value:todo,note:'Ready to be picked up',icon:'board',tone:'blue'}]
  return <div className={styles.shell} onPointerMove={mouseGlow}>
    <WorkspaceNav/>
    <main className={styles.main}>
      <header className={styles.topbar}><div><p>{today}</p><h1>Good to see you, {firstName}.</h1></div><button className={styles.newTask} onClick={goToBoard}><Icon name="plus" size={18}/> New task</button></header>
      <section className={styles.hero}><div className={styles.heroGlow}/><div className={styles.heroContent}><span className={styles.eyebrow}><i/> Your project at a glance</span><h2>Turn ideas into <em>momentum.</em></h2><p>Keep your team aligned and your next steps in sight.</p></div><button onClick={goToBoard}>Open project board <Icon name="arrow" size={18}/></button></section>
      <section className={styles.statsGrid} aria-label="Project statistics">{stats.map((stat,index)=><article className={`${styles.statCard} ${styles[stat.tone]}`} key={stat.label} style={{'--delay':`${index*60}ms`}}><div className={styles.statIcon}><Icon name={stat.icon}/></div><span>{stat.label}</span><strong>{String(stat.value).padStart(2,'0')}</strong><small>{stat.note}</small></article>)}</section>
      <section className={styles.lowerGrid}>
        <article className={styles.tasksPanel}><div className={styles.panelHeader}><div><span>Live board</span><h3>Recent tasks</h3></div><button onClick={goToBoard}>View all <Icon name="arrow" size={15}/></button></div><div className={styles.taskList}>{tasks.length?tasks.map((task,index)=><button className={styles.taskRow} onClick={goToBoard} key={task.id||`${task.title}-${index}`}><span className={styles.taskCheck}><Icon name={isDone(task.columnTitle)?'check':'clock'} size={15}/></span><span className={styles.taskName}><strong>{task.title}</strong><small>{task.assignee||'Unassigned'}</small></span><span className={`${styles.status} ${isDone(task.columnTitle)?styles.statusDone:isDoing(task.columnTitle)?styles.statusDoing:styles.statusTodo}`}>{task.columnTitle}</span><Icon name="arrow" size={16}/></button>):<div className={styles.emptyState}><Icon name="layers" size={28}/><p>No tasks yet. Start by creating your first one.</p></div>}</div></article>
        <article className={styles.progressPanel}><div className={styles.panelHeader}><div><span>All board tasks</span><h3>Overall progress</h3></div></div><div className={styles.ring} style={{'--progress':percent}}><div><strong>{percent}%</strong><small>{total ? `${done} of ${total} tasks` : 'No tasks yet'}</small></div></div><div className={styles.progressLegend}><span><i className={styles.legendDone}/>{done} done</span><span><i className={styles.legendDoing}/>{doing} active</span><span><i className={styles.legendTodo}/>{todo} queued</span></div></article>
      </section>
      <section className={styles.timelinePanel} aria-label="Task deadlines">
        <div className={styles.panelHeader}><div><span>Schedule · next deadlines</span><h3>Upcoming & overdue</h3></div><button onClick={goToBoard}>Plan on board <Icon name="arrow" size={15}/></button></div>
        <p className={styles.timelineIntro}>Open tasks ordered by due date. {unscheduled > 0 && `${unscheduled} open task${unscheduled === 1 ? '' : 's'} still need a due date.`}</p>
        {scheduled.length ? <ol className={styles.timeline}>{scheduled.map((task,index) => <li key={task.id || index} className={task.overdue ? styles.overdue : ''}>
          <button onClick={goToBoard} className={styles.deadlineTask}>
            <time dateTime={task.dueDate}>{task.deadline.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}<small>{task.overdue ? 'Overdue' : 'Due date'}</small></time>
            <span className={styles.timelineDot}/><span className={styles.taskName}><strong>{task.title}</strong><small>{task.assignee || 'Unassigned'} · {task.columnTitle}</small></span><Icon name="arrow" size={16}/>
          </button>
        </li>)}</ol> : <div className={styles.emptyState}><Icon name="clock" size={28}/><p>No scheduled open tasks. Add due dates on the board to see your timeline.</p></div>}
      </section>
    </main>
  </div>
}
