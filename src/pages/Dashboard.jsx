import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, logout, goToBoard, goToTeam, goToReports, goToChat } = useAuth()
  const { board } = useBoard()

  // Calculate stats from board data
  const totalTasks = board.columns.reduce((sum, col) => sum + col.tasks.length, 0)
  const completedTasks = board.columns.find(c => c.title.toLowerCase().includes('done'))?.tasks.length || 0
  const inProgressTasks = board.columns.find(c => c.title.toLowerCase().includes('doing'))?.tasks.length || 0
  const toDoTasks = board.columns.find(c => c.title.toLowerCase().includes('to do') || c.title.toLowerCase().includes('todo'))?.tasks.length || 0

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>TeamPulse</h1>
          <p className={styles.subtitle}>Welcome back, <strong>{user?.username}</strong> 👋</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Intro Card */}
        <div className={styles.introCard}>
          <div className={styles.introContent}>
            <h2 className={styles.introTitle}>Manage your team's tasks efficiently</h2>
            <p className={styles.introText}>
              Monitor progress, track deadlines, and collaborate seamlessly with your team.
            </p>
            <button className={styles.primaryBtn} onClick={goToBoard}>
              Open Board →
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {/* Total Tasks Card */}
          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>📋</span>
              <span className={styles.statLabel}>Total Tasks</span>
            </div>
            <div className={styles.statValue}>{totalTasks}</div>
            <div className={styles.statBar}>
              <div className={styles.statBarFill} style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Completed Card */}
          <div className={styles.statCard} style={{ borderLeftColor: 'var(--color-status-done-accent)' }}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.statValue} style={{ color: 'var(--color-status-done-accent)' }}>
              {completedTasks}
            </div>
            <div className={styles.statBar}>
              <div className={styles.statBarFill} style={{ width: '100%', background: 'var(--color-status-done-accent)' }}></div>
            </div>
          </div>

          {/* In Progress Card */}
          <div className={styles.statCard} style={{ borderLeftColor: 'var(--color-status-doing-accent)' }}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>⚡</span>
              <span className={styles.statLabel}>In Progress</span>
            </div>
            <div className={styles.statValue} style={{ color: 'var(--color-status-doing-accent)' }}>
              {inProgressTasks}
            </div>
            <div className={styles.statBar}>
              <div className={styles.statBarFill} style={{ width: '100%', background: 'var(--color-status-doing-accent)' }}></div>
            </div>
          </div>

          {/* To Do Card */}
          <div className={styles.statCard} style={{ borderLeftColor: 'var(--color-status-todo-accent)' }}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>📝</span>
              <span className={styles.statLabel}>To Do</span>
            </div>
            <div className={styles.statValue} style={{ color: 'var(--color-status-todo-accent)' }}>
              {toDoTasks}
            </div>
            <div className={styles.statBar}>
              <div className={styles.statBarFill} style={{ width: '100%', background: 'var(--color-status-todo-accent)' }}></div>
            </div>
          </div>
        </div>

        {/* Completion Percentage Card */}
        <div className={styles.completionCard}>
          <div className={styles.completionContent}>
            <div className={styles.completionLeft}>
              <h3 className={styles.completionTitle}>Sprint Progress</h3>
              <p className={styles.completionText}>
                {completionPercent}% of tasks completed
              </p>
            </div>
            <div className={styles.completionCircle}>
              <svg viewBox="0 0 100 100" className={styles.progressCircle}>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--color-status-done-accent)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - completionPercent / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                />
              </svg>
              <div className={styles.percentageText}>{completionPercent}%</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actionsCard}>
          <h3 className={styles.actionsTitle}>Quick Actions</h3>
          <div className={styles.actionsList}>
            <button className={styles.actionBtn} onClick={goToBoard}>
              <span className={styles.actionIcon}>🎯</span>
              <span>View Board</span>
            </button>
            <button className={styles.actionBtn} onClick={goToBoard}>
              <span className={styles.actionIcon}>➕</span>
              <span>Create Task</span>
            </button>
            <button className={styles.actionBtn} onClick={goToChat}>
              <span className={styles.actionIcon}>💬</span>
              <span>Messages</span>
            </button>
            <button className={styles.actionBtn} onClick={goToTeam}>
              <span className={styles.actionIcon}>👥</span>
              <span>Team Members</span>
            </button>
            <button className={styles.actionBtn} onClick={goToReports}>
              <span className={styles.actionIcon}>📈</span>
              <span>Reports</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
