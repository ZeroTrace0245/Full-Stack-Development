import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import styles from './Column.module.css'

function getStatusClass(columnTitle) {
  const title = columnTitle.toLowerCase()
  if (title.includes('backlog') || title.includes('todo')) return 'status-todo'
  if (title.includes('dev') || title.includes('doing')) return 'status-doing'
  if (title.includes('prod') || title.includes('done')) return 'status-done'
  return ''
}

export default function Column({ column, onCreateTask, onDeleteTask, onEditTask }) {
  const statusClass = getStatusClass(column.title)
  const columnClass = statusClass ? `${styles.column} ${styles[statusClass]}` : styles.column

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column
    }
  })

  // Ensure tasks are an array and extract their IDs for SortableContext
  const taskIds = column.tasks?.map(task => task.id) || []

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
      <div className={styles.tasks} ref={setNodeRef}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
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
        </SortableContext>
        {column.tasks.length === 0 && (
          <p className={styles.emptyState}>No tasks yet. Click + to add one!</p>
        )}
      </div>
    </div>
  )
}


