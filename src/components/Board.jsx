import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Column from './Column'
import TaskCard from './TaskCard'
import { useBoard } from '../context/BoardContext'
import { useAuth } from '../context/AuthContext'
import styles from './Board.module.css'

export default function Board({ onCreateTask, onDeleteTask, onEditTask }) {
  const { board, handleMoveTask } = useBoard()
  const { user } = useAuth()
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event) => {
    const { active } = event
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task)
    }
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    const sourceColId = active.data.current.columnId

    if (isOverTask) {
      const destColId = over.data.current.columnId

      if (sourceColId !== destColId) {
        const sourceCol = board.columns.find(c => c.id === sourceColId)
        const destCol = board.columns.find(c => c.id === destColId)
        const sourceIndex = sourceCol.tasks.findIndex(t => t.id === activeId)
        const destIndex = destCol.tasks.findIndex(t => t.id === overId)

        handleMoveTask(activeId, sourceColId, destColId, sourceIndex, destIndex, user?.username)
      }
    } else if (isOverColumn) {
      const destColId = overId
      if (sourceColId !== destColId) {
        const sourceCol = board.columns.find(c => c.id === sourceColId)
        const destCol = board.columns.find(c => c.id === destColId)
        const sourceIndex = sourceCol.tasks.findIndex(t => t.id === activeId)

        handleMoveTask(activeId, sourceColId, destColId, sourceIndex, destCol.tasks.length, user?.username)
      }
    }
  }

  const handleDragEnd = (event) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'

    if (isActiveTask && isOverTask) {
      const sourceColId = active.data.current.columnId
      const destColId = over.data.current.columnId

      if (sourceColId === destColId) {
        const col = board.columns.find(c => c.id === sourceColId)
        const sourceIndex = col.tasks.findIndex(t => t.id === activeId)
        const destIndex = col.tasks.findIndex(t => t.id === overId)
        handleMoveTask(activeId, sourceColId, destColId, sourceIndex, destIndex, user?.username)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

