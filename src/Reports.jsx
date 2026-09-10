import React, { useEffect, useMemo, useState } from 'react'
import { useBoard } from '../context/BoardContext'
import { useAuth } from '../context/AuthContext'
import { isDone, isDoing, taskDate } from './dashboardData'
import { reportStress } from '../fixtures/reportStress'
import styles from './Reports.module.css'

const colors = ['#73b7ff', '#ffac79', '#bba0ff', '#58d9bd']
const dateLabel = value => taskDate(value)?.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) || 'Unscheduled'
const deadline = task => taskDate(task.endDate || task.dueDate)
function Panel({ eyebrow, title, children, action, className = '' }) {
  return <section className={`${styles.panel} ${className}`}><header className={styles.panelHead}><div><span className={styles.eyebrow}>{eyebrow}</span><h2>{title}</h2></div>{action}</header>{children}</section>
}
function Empty({ children }) { return <p className={styles.empty}>{children}</p> }

export default function Reports() {
  const { board, activities, error } = useBoard()
  const { goToBoard } = useAuth()
  const preview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('reportsPreview') === 'stress'
  const tasks = preview ? reportStress.tasks : board.columns.flatMap(column => column.tasks.map(task => ({ ...task, status: column.title })))
  const events = preview ? reportStress.activities : activities
  const done = tasks.filter(task => isDone(task.status))
  const active = tasks.filter(task => isDoing(task.status))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const overdue = tasks.filter(task => !isDone(task.status) && deadline(task) && deadline(task) < today)
  const prerequisites = task => [...new Set([...(task.blockedBy || []), ...(task.relationship === 'depends-on' && task.relatedTaskId ? [task.relatedTaskId] : []), ...tasks.filter(other => other.blocking?.includes(task.id) || (other.relationship === 'blocks' && other.relatedTaskId === task.id)).map(other => other.id)])]
  const blocked = tasks.filter(task => !isDone(task.status) && prerequisites(task).some(id => !isDone(tasks.find(other => other.id === id)?.status || '')))
  const completion = tasks.length ? Math.round(done.length / tasks.length * 100) : 0
  const workload = Object.entries(tasks.reduce((result, task) => { const name = task.assignee || 'Unassigned'; result[name] = (result[name] || 0) + 1; return result }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  const types = Object.entries(tasks.reduce((result, task) => { const type = task.type || 'Other'; result[type] = (result[type] || 0) + 1; return result }, {})).map(([label, value], index) => ({ label, value, color: colors[index % colors.length] }))
  let accumulated = 0
  const gradient = types.map(type => { const start = accumulated; accumulated += type.value / tasks.length * 100; return `${type.color} ${start}% ${accumulated}%` }).join(', ')
  const milestones = tasks.filter(task => task.milestone).sort((a, b) => (deadline(a)?.getTime() ?? Infinity) - (deadline(b)?.getTime() ?? Infinity))
  const openTimeline = () => { sessionStorage.setItem('novasync-board-view', 'timeline'); goToBoard() }
  const exportCsv = () => {
    const safeCell = value => { const text = String(value ?? ''); return `"${(/^[=+@\-\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"` }
    const rows = [['Title', 'Status', 'Assignee', 'Priority', 'Due date'], ...tasks.map(task => [task.title, task.status, task.assignee, task.priority, task.endDate || task.dueDate])]
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(safeCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = preview ? 'novasync-sample-report.csv' : 'novasync-report.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div className={styles.reportsView}>
    <div className={styles.content}>
      <header className={styles.header}><div><span className={styles.eyebrow}>WORKSPACE INTELLIGENCE</span><h1>Reports & insights</h1><p>Current board snapshot · {dateLabel(today)}</p></div><button onClick={exportCsv}>↓ Export CSV</button></header>
      {preview && <p className={styles.notice}>Stress preview · sample tasks, activity and sensor readings. No live data is changed.</p>}
      {error && !preview && <p className={styles.notice} role="alert">{error}</p>}
      <section className={`${styles.panel} ${styles.pulse}`} aria-label="Project pulse">
        <div><span className={styles.eyebrow}>PROJECT PULSE · {!tasks.length ? 'AWAITING DATA' : overdue.length || blocked.length ? 'NEEDS ATTENTION' : 'ON TRACK'}</span><h2>{!tasks.length ? 'Your next sprint starts here.' : overdue.length ? `${overdue.length} overdue task${overdue.length === 1 ? ' needs' : 's need'} your attention.` : blocked.length ? 'Clear dependencies to keep work moving.' : 'Your sprint is moving in the right direction.'}</h2><p>{tasks.length ? `${done.length} of ${tasks.length} tasks complete. ${active.length} in progress and ${blocked.length} with unresolved dependencies.` : 'Add tasks to your board to start seeing project insights.'}</p></div>
        <div className={styles.completion}><strong>{completion}%</strong><span>Board complete</span><progress aria-label="Board completion" value={completion} max="100"/></div>
      </section>
      <section className={styles.metrics} aria-label="Board metrics">{[[tasks.length, 'Total tasks', 'Current board'], [active.length, 'In motion', 'In active columns'], [done.length, 'Completed', 'In completed columns'], [overdue.length, 'Overdue', 'Open tasks past deadline']].map(([value, label, note]) => <article className={styles.panel} key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section>
      <div className={styles.summaryGrid}>
        <Panel eyebrow="CAPACITY" title="Team workload" action={<small>{workload.length} assignees</small>}><div className={styles.widgetBody}>{workload.length ? <ul className={styles.bars}>{workload.map(row => <li key={row.label}><div><span>{row.label}</span><b>{row.value}</b></div><div className={styles.barTrack}><i style={{ width: `${row.value / workload[0].value * 100}%` }}/></div></li>)}</ul> : <Empty>Assign tasks to see the workload distribution.</Empty>}</div></Panel>
        <Panel eyebrow="WORK MIX" title="Tasks by type"><div className={styles.widgetBody}>{tasks.length ? <><div className={styles.donut} role="img" aria-label={types.map(type => `${type.label}: ${type.value}`).join(', ')} style={{ background: `conic-gradient(${gradient})` }}><div><strong>{tasks.length}</strong><small>tasks</small></div></div><ul className={styles.legend}>{types.map(type => <li key={type.label}><i style={{ background: type.color }}/><span>{type.label}</span><b>{type.value}</b><small>{Math.round(type.value / tasks.length * 100)}%</small></li>)}</ul></> : <Empty>No task types to display yet.</Empty>}</div></Panel>
        <Panel eyebrow="DELIVERY TARGETS" title="Milestones" action={<small>{milestones.length} total</small>}><div className={styles.widgetBody}>{milestones.length ? <ul className={styles.milestones}>{milestones.map(task => <li key={task.id}><i className={isDone(task.status) ? styles.healthy : deadline(task) < today && deadline(task) ? styles.danger : ''}>◆</i><div><strong>{task.title}</strong><small>{dateLabel(task.endDate || task.dueDate)} · {task.assignee || 'Unassigned'}</small><span>{isDone(task.status) ? 'Complete' : deadline(task) && deadline(task) < today ? 'Overdue' : task.status}</span></div></li>)}</ul> : <Empty>Mark a board task as a milestone to track its delivery here.</Empty>}</div></Panel>
      </div>
      <Schedule tasks={tasks} prerequisites={prerequisites} onOpen={openTimeline}/>
      <div className={styles.detailGrid}>
        <Panel eyebrow="NEXT ACTIONS" title="Today’s briefing"><div className={styles.brief}>{[['Overdue', overdue], ['Unresolved dependencies', blocked], ['In progress', active]].map(([label, items]) => <div key={label}><h3>{label} <span>{items.length}</span></h3>{items.length ? <ul>{items.slice(0, 3).map(task => <li key={task.id}>{task.title}</li>)}</ul> : <p>No tasks in this category.</p>}{items.length > 3 && <small>+{items.length - 3} more on the board</small>}</div>)}</div></Panel>
        <Panel eyebrow="PHYSICAL HARDWARE" title="Environment & system health" action={<span className={styles.badge}>{preview ? 'Sample data' : 'Not connected'}</span>}>
          {preview ? <div className={styles.sensors}>{reportStress.sensors.map(sensor => <article key={sensor.name}><div><i className={sensor.alert ? styles.danger : styles.healthy}>●</i><strong>{sensor.name}</strong><span>{sensor.alert ? 'Alert' : 'Healthy'}</span></div><b>{sensor.value}</b><small>{sensor.detail}</small></article>)}</div> : <Empty>No hardware monitoring feed is connected. Shelf sensor readings and hardware alerts will appear here when an integration is available.</Empty>}
        </Panel>
      </div>
      <ActivityReplay activities={events}/>
    </div>
  </div>
}

function Schedule({ tasks, prerequisites, onOpen }) {
  const rows = tasks.map(task => ({ task, end: deadline(task), start: taskDate(task.startDate) || deadline(task) })).filter(row => row.end && row.start && row.start <= row.end).sort((a, b) => a.start - b.start)
  const first = rows.length ? Math.min(...rows.map(row => row.start.getTime())) : 0
  const last = rows.length ? Math.max(...rows.map(row => row.end.getTime())) : 0
  const span = Math.max(86400000, last - first)
  return <Panel eyebrow="SCHEDULE & DEPENDENCIES" title="Delivery timeline" action={<button onClick={onOpen}>Open timeline ↗</button>}>
    <p className={styles.caption}>Task dates and declared dependencies. Dependency links are not a calculated critical path.</p>
    {rows.length ? <div className={styles.scheduleScroll}><div className={styles.schedule}><div className={styles.scheduleAxis}><span>Task / dependency context</span><div>{[0, .25, .5, .75, 1].map(fraction => <time key={fraction}>{dateLabel(new Date(first + span * fraction))}</time>)}</div></div>{rows.map(({ task, start, end }) => <div className={styles.scheduleRow} key={task.id}><div><strong>{task.title}</strong>{task.assignmentLocked && <small>🔒 Locked to {task.assignee || 'assigned member'}</small>}<small>{dateLabel(start)} → {dateLabel(end)}</small>{prerequisites(task).length > 0 && <details><summary>{prerequisites(task).length} prerequisite(s)</summary><ul>{prerequisites(task).map(id => <li key={id}>{tasks.find(other => other.id === id)?.title || `Unavailable task (${id})`}</li>)}</ul></details>}</div><div className={styles.scheduleTrack}><span role="img" aria-label={`${task.title}: ${dateLabel(start)} to ${dateLabel(end)}${task.milestone ? ', milestone' : ''}`} className={task.milestone ? styles.scheduleMilestone : styles.scheduleBar} style={{ left: `${(start.getTime() - first) / span * 100}%`, width: `${(end - start) / span * 100}%`, background: isDone(task.status) ? '#58d9bd' : '#73b7ff' }}/></div></div>)}</div></div> : <Empty>Add valid task dates to build the project schedule.</Empty>}
    {tasks.length > rows.length && <p className={styles.caption}>{tasks.length - rows.length} task(s) without a valid date range are not plotted.</p>}
  </Panel>
}

function ActivityReplay({ activities }) {
  const [range, setRange] = useState('7')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(2000)
  const events = useMemo(() => {
    const cutoff = range === 'all' ? 0 : Date.now() - Number(range) * 86400000
    return activities.filter(event => new Date(event.timestamp).getTime() >= cutoff && event.text.toLowerCase().includes(query.toLowerCase())).slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [activities, range, query])
  const index = Math.max(0, events.findIndex(event => event.id === selectedId))
  const current = events[index]
  useEffect(() => {
    if (!playing || index >= events.length - 1) return
    const timer = setTimeout(() => { setSelectedId(events[index + 1].id); if (index + 1 === events.length - 1) setPlaying(false) }, speed)
    return () => clearTimeout(timer)
  }, [playing, index, events, speed])
  const select = next => { setPlaying(false); setSelectedId(events[next]?.id || null) }
  return <Panel eyebrow="ACTIVITY HISTORY" title="Activity replay" action={<small>{events.length} matching events</small>}>
    <p className={styles.caption}>Review the activity log in chronological order. Available history covers the latest 50 events from this session; playback does not change the board.</p>
    <div className={styles.replayFilters}><label>Activity period<select value={range} onChange={event => { setRange(event.target.value); setPlaying(false); setSelectedId(null) }}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All available</option></select></label><label>Search history<input value={query} onChange={event => { setQuery(event.target.value); setPlaying(false); setSelectedId(null) }} placeholder="Search task names or changes…"/></label><label>Playback speed<select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value="4000">0.5×</option><option value="2000">1×</option><option value="1000">2×</option></select></label></div>
    {current ? <><div className={styles.replayControls}><button disabled={index === 0} onClick={() => select(index - 1)}>← Previous</button><button disabled={events.length < 2} onClick={() => { if (!playing && index === events.length - 1) setSelectedId(events[0].id); setPlaying(!playing) }}>{playing ? 'Ⅱ Pause' : index === events.length - 1 ? '↻ Replay' : '▶ Play'}</button><button disabled={index === events.length - 1} onClick={() => select(index + 1)}>Next →</button><span>{index + 1} / {events.length}</span></div><input className={styles.scrubber} type="range" aria-label="Select activity event" aria-valuetext={`Event ${index + 1}: ${current.text}`} min="0" max={events.length - 1} value={index} onChange={event => select(Number(event.target.value))}/><article className={styles.selectedEvent} aria-live={playing ? 'off' : 'polite'}><span className={styles.eyebrow}>EVENT {index + 1}</span><h3>{current.text}</h3><time dateTime={current.timestamp}>{new Date(current.timestamp).toLocaleString()}</time></article><ol className={styles.eventList}>{events.map((event, position) => <li key={event.id}><button aria-current={position === index ? 'step' : undefined} onClick={() => select(position)}><span>{String(position + 1).padStart(2, '0')}</span><div><strong>{event.text}</strong><time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleString()}</time></div></button></li>)}</ol></> : <Empty>{activities.length ? 'No activity matches these filters. Try another period or search.' : 'Create, edit or move a board task to start recording activity.'}</Empty>}
  </Panel>
}
