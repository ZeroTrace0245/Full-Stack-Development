import React from 'react'
import { getUserInitials } from '../utils/generateUsers'
import styles from './TaskCard.module.css'

export default function TaskCard({ task, columnId, column, onDelete, onEdit }) {
  return (
    <div
      className={styles.card}
    >
      <div className={styles.cardContent}>
        <h4 className={styles.title}>{task.title}</h4>
        <div className={styles.meta}>
          <div className={styles.avatar} title={task.assignee}>
            {getUserInitials(task.assignee)}
          </div>
          <span>{task.estimate}h estimate</span>
        </div>
      </div>

      {/* Action Buttons (always visible for easy access) */}
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          title="Edit task"
          onClick={(e) => {
            e.stopPropagation()
            console.log('Edit clicked for task:', task.id, task.title)
            onEdit(task, column)
          }}
        >
          ✏️
        </button>
        <button
          className={`${styles.actionBtn} ${styles.delete}`}
          title="Delete task"
          onClick={(e) => {
            e.stopPropagation()
            console.log('Delete clicked for task:', task.id, task.title)
            onDelete(task.id, task.title)
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}



