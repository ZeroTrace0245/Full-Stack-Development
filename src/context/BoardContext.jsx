import React, { createContext, useContext, useEffect, useState } from 'react'
import apiClient from '../api/client'
import { useAuth } from './AuthContext'

const BoardContext = createContext(null)
const COLUMNS = [
  { id: 'col-1', title: 'Sprint Backlog', tasks: [] },
  { id: 'col-2', title: 'In Development', tasks: [] },
  { id: 'col-3', title: 'Deployed to Production', tasks: [] }
]
const INITIAL_BOARD = { id: 'board-1', title: 'NovaSync Board', columns: COLUMNS }
const placeTasks = (tasks) => ({ ...INITIAL_BOARD, columns: COLUMNS.map((column) => ({ ...column, tasks: tasks.filter((task) => task.columnId === column.id) })) })

export function BoardProvider({ children }) {
  const { user } = useAuth()
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { setBoard(INITIAL_BOARD); return }
    apiClient.getTasksForBoard(INITIAL_BOARD.id)
      .then(({ tasks }) => { setBoard(placeTasks(tasks)); setError('') })
      .catch((requestError) => setError(requestError.error || requestError.message || 'Could not load tasks'))
  }, [user])

  const addActivity = (text) => setActivities((current) => [{ id: crypto.randomUUID(), text, timestamp: new Date().toISOString() }, ...current].slice(0, 50))

  const handleCreateTask = async (newTask) => {
    const { task } = await apiClient.createTask({ ...newTask, boardId: board.id })
    setBoard((current) => ({ ...current, columns: current.columns.map((column) => column.id === task.columnId ? { ...column, tasks: [...column.tasks, task] } : column) }))
    addActivity(`Task "${task.title}" was created`)
    return task
  }

  const handleEditTask = async (updatedTask) => {
    const { task } = await apiClient.updateTask(updatedTask.id, updatedTask)
    setBoard((current) => ({ ...current, columns: current.columns.map((column) => ({ ...column, tasks: column.tasks.filter((item) => item.id !== task.id).concat(column.id === task.columnId ? [task] : []) })) }))
    addActivity(`Task "${task.title}" was updated`)
    return task
  }

  const handleDeleteTask = async (taskId, taskTitle) => {
    await apiClient.deleteTask(taskId)
    setBoard((current) => ({ ...current, columns: current.columns.map((column) => ({ ...column, tasks: column.tasks.filter((task) => task.id !== taskId) })) }))
    addActivity(`Task "${taskTitle}" was deleted`)
  }

  const handleMoveTask = async (taskId, sourceColId, destColId, sourceIndex, destIndex, username = 'Someone') => {
    const movedTask = board.columns.find((column) => column.id === sourceColId)?.tasks.find((task) => task.id === taskId)
    if (!movedTask) return
    setBoard((current) => {
      const columns = current.columns.map((column) => ({ ...column, tasks: [...column.tasks] }))
      const from = columns.find((column) => column.id === sourceColId)
      const to = columns.find((column) => column.id === destColId)
      const [task] = from.tasks.splice(sourceIndex, 1)
      task.columnId = destColId
      to.tasks.splice(destIndex, 0, task)
      return { ...current, columns }
    })
    try { await apiClient.updateTask(taskId, { columnId: destColId, order: destIndex }) } catch (requestError) { setError(requestError.error || 'Could not move task') }
    if (sourceColId !== destColId) addActivity(`${username} moved '${movedTask.title}' to ${board.columns.find((column) => column.id === destColId)?.title}`)
  }

  const handleSetAssignment = async (taskId, assignedUserId, assignmentLocked) => {
    const { task } = await apiClient.setTaskAssignment(taskId, assignedUserId, assignmentLocked)
    setBoard(current => ({ ...current, columns: current.columns.map(column => ({ ...column, tasks: column.tasks.map(item => item.id === task.id ? task : item) })) }))
    addActivity(`Task "${task.title}" assignment was ${task.assignmentLocked ? 'locked' : 'updated'}`)
    return task
  }

  return <BoardContext.Provider value={{ board, activities, error, handleCreateTask, handleEditTask, handleDeleteTask, handleMoveTask, handleSetAssignment, addActivity }}>{children}</BoardContext.Provider>
}

export const useBoard = () => useContext(BoardContext)
