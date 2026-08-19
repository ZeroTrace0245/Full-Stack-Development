import React, { createContext, useContext, useState, useEffect } from 'react'
import { loadBoardFromStorage, saveBoardToStorage } from '../utils/boardStorage'

const BoardContext = createContext(null)

const INITIAL_BOARD = {
  id: 'board-1',
  title: 'ProBoard master',
  columns: [
    {
      id: 'col-1',
      title: 'Sprint Backlog',
      tasks: [
        { id: 't1', title: 'Set up project repo', description: 'Initialize Git', assignee: 'USER 001', estimate: 1, priority: 'High', type: 'Feature', dueDate: '2023-12-01' }
      ]
    },
    {
      id: 'col-2',
      title: 'In Development',
      tasks: [
        { id: 't2', title: 'Design wireframes', description: 'Figma mockups', assignee: 'USER 002', estimate: 3, priority: 'Medium', type: 'UI', dueDate: '2023-12-05' }
      ]
    },
    {
      id: 'col-3',
      title: 'Deployed to Production',
      tasks: [
        { id: 't3', title: 'Write API documentation', description: 'Swagger docs', assignee: 'USER 003', estimate: 2, priority: 'Low', type: 'Feature', dueDate: '2023-11-20' }
      ]
    }
  ]
}

export function BoardProvider({ children }) {
  const [board, setBoard] = useState(() => {
    const saved = loadBoardFromStorage()
    return saved || INITIAL_BOARD
  })

  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('proboard_activities')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    saveBoardToStorage(board)
  }, [board])

  useEffect(() => {
    localStorage.setItem('proboard_activities', JSON.stringify(activities))
  }, [activities])

  const addActivity = (msg) => {
    const newActivity = { id: Date.now().toString(), text: msg, timestamp: new Date().toISOString() }
    setActivities(prev => [newActivity, ...prev].slice(0, 50))
  }

  const handleCreateTask = (newTask) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(col =>
        col.id === newTask.columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    }))
    addActivity(`Task "${newTask.title}" was created in ${board.columns.find(c => c.id === newTask.columnId)?.title}`)
  }

  const handleEditTask = (updatedTask) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
      }))
    }))
    addActivity(`Task "${updatedTask.title}" was updated`)
  }

  const handleDeleteTask = (taskId, taskTitle) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId)
      }))
    }))
    addActivity(`Task "${taskTitle}" was deleted`)
  }

  const handleMoveTask = (taskId, sourceColId, destColId, sourceIndex, destIndex, username = 'Someone') => {
    setBoard(prevBoard => {
      const sourceCol = prevBoard.columns.find(c => c.id === sourceColId)
      const destCol = prevBoard.columns.find(c => c.id === destColId)

      const sourceTasks = Array.from(sourceCol.tasks)
      const [movedTask] = sourceTasks.splice(sourceIndex, 1)

      if (sourceColId === destColId) {
        sourceTasks.splice(destIndex, 0, movedTask)
        return {
          ...prevBoard,
          columns: prevBoard.columns.map(c => c.id === sourceColId ? { ...c, tasks: sourceTasks } : c)
        }
      }

      const destTasks = Array.from(destCol.tasks)
      destTasks.splice(destIndex, 0, movedTask)
      movedTask.columnId = destColId

      return {
        ...prevBoard,
        columns: prevBoard.columns.map(c => {
          if (c.id === sourceColId) return { ...c, tasks: sourceTasks }
          if (c.id === destColId) return { ...c, tasks: destTasks }
          return c
        })
      }
    })

    const sourceCol = board.columns.find(c => c.id === sourceColId)
    const destCol = board.columns.find(c => c.id === destColId)
    const task = sourceCol.tasks.find(t => t.id === taskId)
    if (sourceColId !== destColId) {
         addActivity(`${username} moved '${task?.title || taskId}' to ${destCol?.title} at ${new Date().toLocaleTimeString()}`)
    }
  }

  return (
    <BoardContext.Provider value={{
      board,
      activities,
      handleCreateTask,
      handleEditTask,
      handleDeleteTask,
      handleMoveTask,
      addActivity
    }}>
      {children}
    </BoardContext.Provider>
  )
}

export const useBoard = () => useContext(BoardContext)