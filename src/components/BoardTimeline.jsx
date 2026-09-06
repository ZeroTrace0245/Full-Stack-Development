import { taskDate } from '../pages/dashboardData'
import styles from './Board.module.css'

export default function BoardTimeline({ columns, user, onEditTask }) {
  const tasks = columns.flatMap(column => column.tasks.map(task => ({ task, column, date: taskDate(task.endDate || task.dueDate) })))
    .sort((a, b) => (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return <section className={styles.timeline} aria-label="Task deadline timeline">
    <header><h2>Task timeline</h2><p>Filtered tasks ordered by deadline. Tasks without dates appear last.</p></header>
    {tasks.length ? <ol>{tasks.map(({ task, column, date }) => {
      const canChange = !task.assignmentLocked || user?.role === 'Admin' || String(task.assignedUserId) === String(user?.id)
      const overdue = date && date < today && !/done|complete|deployed|production/i.test(column.title)
      return <li key={task.id} className={overdue ? styles.overdue : ''}>
        <div className={styles.timelineDate}>{date ? <time dateTime={task.endDate || task.dueDate}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time> : <span>Unscheduled</span>}<small>{overdue ? 'Overdue' : date ? 'Due date' : 'Add a due date'}</small></div>
        <span className={styles.timelineMarker} aria-hidden="true"/>
        <article className={styles.timelineTask}><div className={styles.timelineTags}><span>{column.title}</span>{task.assignmentLocked && <span className={styles.assignmentLock}>🔒 Locked to {task.assignee || 'assigned member'}</span>}{task.milestone && <span>◇ Milestone</span>}{task.priority && <span>{task.priority} priority</span>}</div><h3>{task.title}</h3>{task.startDate && <p>Start: <time dateTime={task.startDate}>{taskDate(task.startDate)?.toLocaleDateString()}</time> → End: {date?.toLocaleDateString() || 'Not scheduled'}</p>}{task.blockedBy?.length > 0 && <p>Blocked by: {task.blockedBy.map(id=>tasks.find(entry=>entry.task.id===id)?.task.title || id).join(', ')}</p>}{task.blocking?.length > 0 && <p>Blocking: {task.blocking.map(id=>tasks.find(entry=>entry.task.id===id)?.task.title || id).join(', ')}</p>}<p>{task.assignee || 'Unassigned'}{task.estimate ? ` · ${task.estimate}h estimated` : ''}</p>{task.relationship && <p>↗ {task.relationship.replaceAll('-', ' ')} {tasks.find(entry => entry.task.id === task.relatedTaskId)?.task.title || task.relatedTaskId || 'another task'}</p>}<button type="button" disabled={!canChange} onClick={() => onEditTask(task, column)}>{canChange ? 'Edit task' : 'Assignment locked'}</button></article>
      </li>
    })}</ol> : <div className={styles.timelineEmpty}><h3>No matching tasks</h3><p>Create a task or clear your filters to start planning.</p></div>}
  </section>
}
