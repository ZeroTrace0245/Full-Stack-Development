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
import WorkspaceNav from './components/WorkspaceNav'
import AdminPanel from './pages/AdminPanel'
import AdminLoginPage from './pages/AdminLoginPage'
import UserSettings from './pages/UserSettings'
import NotificationCenter from './components/NotificationCenter'
import styles from './App.module.css'

function WorkspacePage({ children }) {
  return <div className={styles.workspaceLayout}><WorkspaceNav /><div className={styles.workspaceContent}>{children}</div></div>
}

function AppContent() {
  const { isLoggedIn, isLoading, currentPage, goToDashboard, user } = useAuth()
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

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    await handleDeleteTask(deleteConfirm.taskId, deleteConfirm.taskTitle)
    setDeleteConfirm(null)
  }

  const onSubmitTask = async (taskData) => {
    if (editingTask) {
      await handleEditTask({ ...taskData, id: editingTask.id })
    } else {
      await handleCreateTask(taskData)
    }
    setIsModalOpen(false)
    setEditingTask(null)
    setSelectedColumn(null)
  }

  if (isLoading) {
    return <div className={styles.authLoading}>Opening your workspace…</div>
  }

  if (!isLoggedIn) {
    return currentPage === 'admin-login' ? <AdminLoginPage /> : <LoginPage />
  }

  if (currentPage === 'dashboard') {
    return <Dashboard />
  }

  if (currentPage === 'team') {
    return <WorkspacePage><TeamMembers /></WorkspacePage>
  }

  if (currentPage === 'chat') {
    return <WorkspacePage><Chat /></WorkspacePage>
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
    return <WorkspacePage><Reports /></WorkspacePage>
  }

  if (currentPage === 'admin') {
    if (user?.role !== 'Admin') return <WorkspacePage><div className={styles.authLoading}>Administrator access required.</div></WorkspacePage>
    return <WorkspacePage><AdminPanel /></WorkspacePage>
  }

  if (currentPage === 'settings') return <WorkspacePage><UserSettings /></WorkspacePage>

  return (
    <WorkspacePage><div className={styles.app}>
      <button className={styles.activityToggle} onClick={() => setShowActivity(s => !s)} aria-pressed={showActivity}>◴ Activity</button>
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
    </div></WorkspacePage>
  )
}

function App() {
  return (
    <AuthProvider>
      <NotificationCenter />
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </AuthProvider>
  )
}

export default App
