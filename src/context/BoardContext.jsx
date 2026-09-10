import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import apiClient from '../api/client'
import { useAuth } from './AuthContext'
import { moveBoardTask } from '../utils/moveBoardTask'

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
  const userId = user?.id
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [activities, setActivities] = useState([])
  const pendingDeletes = useRef(new Map())
  const session = useRef(0)
  const [deletions, setDeletions] = useState([])
  const [notice, setNotice] = useState('')
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(timer) }, [notice])
  const [error, setError] = useState('')

  useEffect(() => () => { session.current++; pendingDeletes.current.forEach(item=>clearTimeout(item.timer)); pendingDeletes.current.clear() }, [user?.id])

  useEffect(() => {
    setDeletions([]); setNotice(''); setError('')
    setActivities([])
    let alive = true
    if (!userId) { setBoard(INITIAL_BOARD); return }
    apiClient.getTasksForBoard(INITIAL_BOARD.id)
      .then(({ tasks }) => { if (alive) { setBoard(placeTasks(tasks)); setError('') } })
      .catch((requestError) => { if (alive) setError(requestError.error || requestError.message || 'Could not load tasks') })
    return () => { alive = false }
  }, [userId])

  const addActivity = (text) => setActivities((current) => [{ id: crypto.randomUUID(), text, timestamp: new Date().toISOString() }, ...current].slice(0, 50))

  const handleCreateTask = async (newTask) => {
    const { task } = await apiClient.createTask({ ...newTask, boardId: board.id })
    setBoard((current) => ({ ...current, columns: current.columns.map((column) => column.id === task.columnId ? { ...column, tasks: [...column.tasks, task] } : column) }))
    addActivity(`Task "${task.title}" was created`)
    setNotice('Task saved.'); setError('')
    return task
  }

  const handleEditTask = async (updatedTask) => {
    const { task } = await apiClient.updateTask(updatedTask.id, updatedTask)
    setBoard((current) => ({ ...current, columns: current.columns.map((column) => ({ ...column, tasks: column.tasks.filter((item) => item.id !== task.id).concat(column.id === task.columnId ? [task] : []) })) }))
    addActivity(`Task "${task.title}" was updated`)
    setNotice('Task saved.'); setError('')
    return task
  }

  const handleDeleteTask = (taskId, taskTitle) => {
    if (pendingDeletes.current.has(taskId)) return
    const item = { taskId, taskTitle }
    const deletionSession = session.current
    item.timer = setTimeout(async () => {
      pendingDeletes.current.delete(taskId)
      try {
        await apiClient.deleteTask(taskId)
        if (session.current !== deletionSession) return
        setBoard(current => ({ ...current, columns: current.columns.map(column => ({ ...column, tasks: column.tasks.filter(task => task.id !== taskId) })) }))
        addActivity(`Task "${taskTitle}" was deleted`)
        setNotice('Task deleted.')
      } catch (err) { if (session.current === deletionSession) setError(`${err.error || err.message || 'Could not delete task.'} The task has been restored.`) }
      finally { if (session.current === deletionSession) setDeletions(current=>current.filter(entry=>entry.taskId!==taskId)) }
    }, 10000)
    pendingDeletes.current.set(taskId, item)
    setDeletions(current=>[...current,item])
  }
  const undoDelete = taskId => {
    const item = pendingDeletes.current.get(taskId)
    if (!item) return
    clearTimeout(item.timer); pendingDeletes.current.delete(taskId)
    setDeletions(current=>current.filter(entry=>entry.taskId!==taskId))
    setNotice('Deletion undone.')
  }

  const handleMoveTask = async (taskId, sourceColId, destColId, sourceIndex, destIndex, username = 'Someone') => {
    const movedTask = board.columns.find((column) => column.id === sourceColId)?.tasks.find((task) => task.id === taskId)
    if (!movedTask) return
    const hiddenIds = [...deletions.map(item => item.taskId), ...board.columns.flatMap(column => column.tasks).filter(task => task.archived).map(task => task.id)]
    setBoard(current => moveBoardTask(current, taskId, sourceColId, destColId, destIndex, hiddenIds))
    try { await apiClient.updateTask(taskId, { columnId: destColId, order: destIndex }) } catch (requestError) { setError(requestError.error || 'Could not move task') }
    if (sourceColId !== destColId) addActivity(`${username} moved '${movedTask.title}' to ${board.columns.find((column) => column.id === destColId)?.title}`)
  }

  const handleSetAssignment = async (taskId, assignedUserId, assignmentLocked) => {
    const { task } = await apiClient.setTaskAssignment(taskId, assignedUserId, assignmentLocked)
    setBoard(current => ({ ...current, columns: current.columns.map(column => ({ ...column, tasks: column.tasks.map(item => item.id === task.id ? task : item) })) }))
    addActivity(`Task "${task.title}" assignment was ${task.assignmentLocked ? 'locked' : 'updated'}`)
    return task
  }

  return <BoardContext.Provider value={{ archivedTasks: board.columns.flatMap(column => column.tasks).filter(task => task.archived), board: { ...board, columns: board.columns.map(column=>({...column,tasks:column.tasks.filter(task=>!task.archived && !deletions.some(item=>item.taskId===task.id))})) }, activities, error, handleCreateTask, handleEditTask, handleDeleteTask, handleMoveTask, handleSetAssignment, addActivity }}>{children}{user && <aside className="task-feedback" aria-label="Task updates">
      {error && <p role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss error">×</button></p>}
      {notice && <p role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss update">×</button></p>}
      {deletions.map(item=><p key={item.taskId} role="status">Deleting “{item.taskTitle}”<button disabled={!pendingDeletes.current.has(item.taskId)} onClick={()=>undoDelete(item.taskId)}>Undo</button></p>)}
    </aside>}</BoardContext.Provider>
}

export const useBoard = () => useContext(BoardContext)
