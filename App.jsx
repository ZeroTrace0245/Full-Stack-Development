import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Board from './components/Board'
import Modal from './components/Modal'
import TaskForm from './components/TaskForm'
import ConfirmDialog from './components/ConfirmDialog'
import { saveBoardToStorage, loadBoardFromStorage } from './utils/boardStorage'
import TeamMembers from './pages/TeamMembers'
import Reports from './pages/Reports'
import styles from './App.module.css'

// Initial board data
const INITIAL_BOARD = {
  id: 'board-1',
  title: 'Sprint Board',
  columns: [
    {
      id: 'col-1',
      title: 'To Do',
      tasks: [
        { id: 't1', title: 'Set up project repo', assignee: 'USER 001', estimate: 1 },
        { id: 't2', title: 'Design wireframes', assignee: 'USER 002', estimate: 3 },
        { id: 't3', title: 'Write API documentation', assignee: 'USER 003', estimate: 2 },
        { id: 't4', title: 'Setup CI/CD pipeline', assignee: 'USER 004', estimate: 4 },
        { id: 't5', title: 'Database schema design', assignee: 'USER 005', estimate: 5 }
      ]
    },
    {
      id: 'col-2',
      title: 'Doing',
      tasks: [
        { id: 't6', title: 'Implement auth module', assignee: 'USER 006', estimate: 5 },
        { id: 't7', title: 'Create dashboard UI', assignee: 'USER 007', estimate: 4 },
        { id: 't8', title: 'Backend API setup', assignee: 'USER 008', estimate: 6 },
        { id: 't9', title: 'User profile page', assignee: 'USER 009', estimate: 3 }
      ]
    },
    {
      id: 'col-3',
      title: 'Done',
      tasks: [
        { id: 't10', title: 'Project kickoff', assignee: 'USER 010', estimate: 1 },
        { id: 't11', title: 'Requirements gathering', assignee: 'USER 011', estimate: 2 },
        { id: 't12', title: 'Architecture review', assignee: 'USER 012', estimate: 3 }
      ]
    }
  ]
}

function AppContent() {
  const { isLoggedIn, currentPage, goToDashboard } = useAuth()
  const [board, setBoard] = useState(() => {
    const savedBoard = loadBoardFromStorage()
    return savedBoard || INITIAL_BOARD
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Save board to localStorage whenever it changes
  useEffect(() => {
    saveBoardToStorage(board)
  }, [board])

  const handleCreateTaskClick = (column) => {
    setEditingTask(null)
    setSelectedColumn(column)
    setIsModalOpen(true)
  }

  const handleEditTaskClick = (task, column) => {
    setEditingTask(task)
    setSelectedColumn(column)
    setIsModalOpen(true)
  }

  const handleDeleteTaskClick = (taskId, taskTitle) => {
    setDeleteConfirm({ taskId, taskTitle })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return

    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== deleteConfirm.taskId)
      }))
    }))
    setDeleteConfirm(null)
  }

  const handleCreateTask = (newTask) => {
    if (editingTask) {
      // Edit mode: update existing task in all columns
      setBoard(prevBoard => ({
        ...prevBoard,
        columns: prevBoard.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(t =>
            t.id === editingTask.id
              ? {
                  id: t.id,  // Keep original ID
                  title: newTask.title,
                  assignee: newTask.assignee,
                  estimate: newTask.estimate,
                  columnId: t.columnId  // Keep original column
                }
              : t
          )
        }))
      }))
    } else {
      // Create mode: add new task
      setBoard(prevBoard => ({
        ...prevBoard,
        columns: prevBoard.columns.map(col =>
          col.id === newTask.columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        )
      }))
    }
    setIsModalOpen(false)
    setEditingTask(null)
    setSelectedColumn(null)
  }

  const handleMoveTask = (taskId, sourceColumnId, destColumnId, destIndex) => {
    setBoard(prevBoard => {
      const newColumns = prevBoard.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId)
      }))

      const sourceCol = newColumns.find(c => c.id === sourceColumnId)
      const task = sourceCol.tasks.find(t => t.id === taskId)

      if (!task) {
        return prevBoard
      }

      const destCol = newColumns.find(c => c.id === destColumnId)
      const destTasks = [...destCol.tasks]
      destTasks.splice(destIndex, 0, task)

      return {
        ...prevBoard,
        columns: newColumns.map(col =>
          col.id === destColumnId ? { ...col, tasks: destTasks } : col
        )
      }
    })
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage />
  }

  // Show dashboard, team, reports or board based on current page
  if (currentPage === 'dashboard') {
    return <Dashboard board={board} />
  }

  if (currentPage === 'team') {
    return <TeamMembers />
  }

  if (currentPage === 'reports') {
    return <Reports board={board} />
  }

  // Show kanban board
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>TeamPulse - Sprint Board</h1>
          <button
            className={styles.backBtn}
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Board
          board={board}
          onCreateTask={handleCreateTaskClick}
          onMoveTask={handleMoveTask}
          onDeleteTask={handleDeleteTaskClick}
          onEditTask={handleEditTaskClick}
        />
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
          setSelectedColumn(null)
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          columns={board.columns}
          selectedColumn={selectedColumn}
          onSubmit={handleCreateTask}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingTask(null)
            setSelectedColumn(null)
          }}
          editingTask={editingTask}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteConfirm?.taskTitle}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
