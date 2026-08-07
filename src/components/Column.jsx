import React from 'react'
import TaskCard from './TaskCard'
import styles from './Column.module.css'

function getStatusClass(columnTitle) {
  const title = columnTitle.toLowerCase()
  if (title.includes('todo') || title.includes('to do')) return 'status-todo'
  if (title.includes('doing') || title.includes('in progress')) return 'status-doing'
  if (title.includes('done')) return 'status-done'
  return ''
}

export default function Column({ column, onCreateTask, onDeleteTask, onEditTask }) {
  const statusClass = getStatusClass(column.title)
  const columnClass = statusClass ? `${styles.column} ${styles[statusClass]}` : styles.column

  return (
    <div className={columnClass}>
      <div className={styles.headerRow}>
        <h3 className={styles.header}>{column.title}</h3>
        <button
          className={styles.addBtn}
          onClick={() => onCreateTask(column)}
          title="Add new task"
          aria-label={`Add task to ${column.title}`}
        >
          +
        </button>
      </div>
      <div className={styles.tasks}>
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            column={column}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
          />
        ))}
        {column.tasks.length === 0 && (
          <p className={styles.emptyState}>No tasks yet. Click + to add one!</p>
        )}
      </div>
    </div>
  )
}


