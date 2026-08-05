import React from 'react'
import { DndContext } from '@dnd-kit/core'
import Column from './Column'
import styles from './Board.module.css'

export default function Board({ board, onCreateTask, onMoveTask, onDeleteTask, onEditTask }) {
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    // Extract task ID and column ID from drag item
    const taskId = active.id
    const sourceColumnId = active.data?.current?.columnId
    const destColumnId = over.data?.current?.columnId

    // Only move if source and dest are different
    if (sourceColumnId && destColumnId && sourceColumnId !== destColumnId) {
      const destIndex = over.data?.current?.index || 0
      onMoveTask(taskId, sourceColumnId, destColumnId, destIndex)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={styles.board}>
        <h2 className={styles.title}>{board.title}</h2>
        <div className={styles.columns}>
          {board.columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              onCreateTask={onCreateTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}

