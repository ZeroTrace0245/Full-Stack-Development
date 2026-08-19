import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BoardProvider, useBoard } from './context/BoardContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Board from './components/Board'
import Modal from './components/Modal'
import TaskForm from './components/TaskForm'
import ConfirmDialog from './components/ConfirmDialog'
import ActivityFeed from './components/ActivityFeed'
import TeamMembers from './pages/TeamMembers'
import Reports from './pages/Reports'
import Chat from './pages/Chat'
import styles from './App.module.css'

function AppContent() {
  const { isLoggedIn, currentPage, goToDashboard, user } = useAuth()
  const { board, handleCreateTask, handleEditTask, handleDeleteTask } = useBoard()
  const [showActivity, setShowActivity] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

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
    handleDeleteTask(deleteConfirm.taskId, deleteConfirm.taskTitle)
    setDeleteConfirm(null)
  }

  const onSubmitTask = (taskData) => {
    if (editingTask) {
      handleEditTask({ ...taskData, id: editingTask.id })
    } else {
      handleCreateTask({ ...taskData, id: 't' + Date.now() })
    }
    setIsModalOpen(false)
    setEditingTask(null)
    setSelectedColumn(null)
  }

  if (!isLoggedIn) {
    return <LoginPage />
  }

  if (currentPage === 'dashboard') {
    return <Dashboard />
  }

  if (currentPage === 'team') {
    return <TeamMembers />
  }

  if (currentPage === 'chat') {
    return <Chat />
  }

  if (currentPage === 'reports') {
    if (user?.role !== 'Admin') {
      return (
        <div className={styles.app} style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Access Denied</h2>
          <p>This section is reserved for Administrators only.</p>
          <button onClick={goToDashboard} className={styles.button}>Return to Dashboard</button>
        </div>
      )
    }
    return <Reports />
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>TeamPulse - Sprint Board</h1>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <button className={styles.activityToggle} onClick={() => setShowActivity(s => !s)} aria-pressed={showActivity}>
              Activity
            </button>
            <button className={styles.backBtn} onClick={goToDashboard}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Board
          onCreateTask={handleCreateTaskClick}
          onDeleteTask={handleDeleteTaskClick}
          onEditTask={handleEditTaskClick}
        />
        {showActivity && (
          <aside className={styles.sidebar}>
            <ActivityFeed />
          </aside>
        )}
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
          onSubmit={onSubmitTask}
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
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </AuthProvider>
  )
}

export default App
