import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getUserInitials } from '../utils/generateUsers'
import styles from './TaskCard.module.css'
import { useAuth } from '../context/AuthContext'

export default function TaskCard({ task, columnId, column, onDelete, onEdit }) {
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
      className={styles.card}
      {...attributes}
      {...listeners}
    >
      <div className={styles.cardContent}>
        <div className={styles.badges}>
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

      {/* Compact action menu: single affordance + hover-revealed secondary actions */}
      {canChange && <div className={styles.actions}>
        <button
          className={styles.menuBtn}
          title="Actions"
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Open actions"
        >
          ⋮
        </button>

        <div className={styles.secondary}>
          <button
            className={styles.actionBtn}
            title="Edit task"
            onPointerDown={(e) => {
              e.stopPropagation()
              onEdit(task, column)
            }}
          >
            ✏️
          </button>
          <button
            className={`${styles.actionBtn} ${styles.delete}`}
            title="Delete task"
            onPointerDown={(e) => {
              e.stopPropagation()
              onDelete(task.id, task.title)
            }}
          >
            🗑️
          </button>
        </div>
      </div>}
    </div>
  )
}



