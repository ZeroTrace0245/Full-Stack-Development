import React, { useRef, useState } from 'react'
import { duplicateTask } from '../utils/taskTools'
import { useBoard } from '../context/BoardContext'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getUserInitials } from '../utils/generateUsers'
import styles from './TaskCard.module.css'
import { useAuth } from '../context/AuthContext'

export default function TaskCard({ task, columnId, column, onDelete, onEdit }) {
  const { board, handleEditTask, handleCreateTask } = useBoard()
  const [busy, setBusy] = useState(false), [feedback, setFeedback] = useState('')
  const pending = useRef(false)
  const doneColumn = board.columns.find(item=>/done|complete|deployed|production/i.test(item.title))
  const quickAction = async action => {
    if (pending.current) return
    pending.current=true; setBusy(true); setFeedback('')
    try { await action() } catch (err) { setFeedback(err.error || err.message || 'Action failed. Please try again.') }
    finally { pending.current=false; setBusy(false) }
  }
  const { user } = useAuth()
  const canChange = !task.assignmentLocked || user?.role === 'Admin' || String(task.assignedUserId) === String(user?.id)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    disabled: !canChange,
    data: {
      type: 'Task',
      task,
      columnId
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.1)' : undefined
  }

  const priorityBadge = { High: '●', Medium: '●', Low: '●' }
  const dueDays = task.dueDate ? Math.ceil((new Date(task.dueDate) - new Date(new Date().toDateString())) / 86400000) : null
  const subtaskDone = (task.subtasks || []).filter(item => item.completed).length

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.cardContent}>
        <div className={styles.badges}>{task.milestone && <span className={styles.badgeType}>◇ Milestone</span>}
          {task.priority && <span className={styles.badge}>{priorityBadge[task.priority]} {task.priority}</span>}
          {task.type && <span className={styles.badgeType}>{task.type}</span>}
          {task.assignmentLocked && <span className={styles.badge} title={canChange ? 'Assigned exclusively to you' : `Locked to ${task.assignee}`}>🔒 {canChange && user?.role !== 'Admin' ? 'Your task' : task.assignee}</span>}
        </div>
        <h4 className={styles.title}>{task.title}</h4>
        {task.description && <p className={styles.description}>{task.description}</p>}
        {(task.labels || []).length > 0 && <div className={styles.labels}>{task.labels.map(label => <span key={label}>#{label}</span>)}</div>}
        {task.relationship && <div className={styles.relationship}>↗ {task.relationship.replace('-', ' ')} {task.relatedTaskId || 'another task'}</div>}
        {task.dueDate && <div className={`${styles.dueDate} ${dueDays < 0 ? styles.overdue : dueDays <= 3 ? styles.dueSoon : ''}`}>◷ {dueDays < 0 ? `${Math.abs(dueDays)}d overdue` : dueDays === 0 ? 'Due today' : task.dueDate}</div>}
        {(task.progress > 0 || task.subtasks?.length > 0) && <div className={styles.progress}><i style={{width:`${task.progress || (subtaskDone / task.subtasks.length * 100)}%`}}/><span>{task.progress || Math.round(subtaskDone / task.subtasks.length * 100)}%</span></div>}
        <div className={styles.meta}>
          <div className={styles.avatar} title={task.assignee}>
            {getUserInitials(task.assignee)}
          </div>
          <span>{task.estimate}h</span>
          {task.subtasks?.length > 0 && <span>☑ {subtaskDone}/{task.subtasks.length}</span>}
          {task.comments?.length > 0 && <span>◌ {task.comments.length}</span>}
        </div>
      </div>

      {feedback&&<p role="status">{feedback}</p>}
      {/* Compact action menu: single affordance + hover-revealed secondary actions */}
      {canChange && onEdit && onDelete && <div className={styles.actions} onKeyDown={e=>e.stopPropagation()}>
        <div className={styles.secondary}>
          <button type="button" disabled={busy} className={styles.actionBtn} title="Duplicate task" aria-label={`Duplicate ${task.title}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();quickAction(()=>handleCreateTask(duplicateTask(task,board.columns[0].id)))}}>⧉+</button>
          {doneColumn && task.columnId!==doneColumn.id && <button type="button" disabled={busy} className={styles.actionBtn} title="Mark complete" aria-label={`Complete ${task.title}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();quickAction(()=>handleEditTask({id:task.id,columnId:doneColumn.id}))}}>✓</button>}
          <button type="button" disabled={busy} className={styles.actionBtn} title="Copy task details" aria-label={`Copy ${task.title}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();quickAction(async()=>{await navigator.clipboard.writeText([task.title,task.description,`Priority: ${task.priority}`,`Assignee: ${task.assignee||'Unassigned'}`].filter(Boolean).join('\n'));setFeedback('Copied.')})}}>⧉</button>
          <button
            className={styles.actionBtn}
            disabled={busy} title="Edit task"
            aria-label={`Edit ${task.title}`}
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>{e.stopPropagation();onEdit(task,column)}}
          >
            ✏️
          </button>
          <button
            className={`${styles.actionBtn} ${styles.delete}`}
            disabled={busy} title="Delete task"
            aria-label={`Delete ${task.title}`}
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>{e.stopPropagation();onDelete(task.id,task.title)}}
          >
            🗑️
          </button>
        </div>
      </div>}
    </div>
  )
}



