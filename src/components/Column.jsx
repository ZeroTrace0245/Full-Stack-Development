import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import styles from './Column.module.css'

function getStatusClass(columnTitle) {
  const title = columnTitle.toLowerCase()
  if (/prod|done|complete|deployed/.test(title)) return 'status-done'
  if (/dev|doing|progress/.test(title)) return 'status-doing'
  if (/backlog|to\s?do/.test(title)) return 'status-todo'
  return ''
}

export default function Column({ column, collapsed, onToggle, onCreateTask, onDeleteTask, onEditTask, filtered }) {
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
        <button className={styles.collapseBtn} onClick={onToggle} aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${column.title}`}>{collapsed ? '›' : '⌄'}</button>
        <h3 className={styles.header}>{column.title} <span>{column.tasks.length}</span></h3>
        <button
          className={styles.addBtn}
          onClick={() => onCreateTask(column)}
          title="Add new task"
          aria-label={`Add task to ${column.title}`}
        >
          +
        </button>
      </div>
      {!collapsed && <div className={styles.tasks} data-scroll-key={column.id} ref={setNodeRef}>
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
          <div className={styles.emptyState}><svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="7" y="8" width="34" height="32" rx="6"/><path d="M15 18h18M15 25h12M15 32h8"/></svg><strong>{filtered ? 'No matching tasks' : 'Ready for your next task'}</strong><p>{filtered ? 'Try adjusting your search or filters.' : 'Add a task or drag one into this column.'}</p></div>
        )}
      </div>}
    </div>
  )
}


