import React, { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Reports.module.css'

// Simple SVG bar chart component
function BarChart({ data = [], labels = [], height = 120, color = '#0078d4' }) {
  const max = Math.max(...data, 1)
  const barWidth = Math.max(10, Math.floor( (100 / data.length) - 2 ))

  return (
    <svg viewBox={`0 0 100 ${height}`} className={styles.chart} preserveAspectRatio="none">
      {data.map((v, i) => {
        const h = (v / max) * (height - 20)
        const x = (i * (100 / data.length)) + 1
        const y = height - h
        return (
          <rect key={i} x={`${x}%`} y={y} width={`${barWidth}%`} height={h} fill={color} rx="2" />
        )
      })}
    </svg>
  )
}

// Simple SVG line chart component
function LineChart({ data = [], height = 120, color = '#00b894' }) {
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * 100
    const y = height - (v / max) * (height - 20)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 100 ${height}`} className={styles.chart} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

import { useBoard } from '../context/BoardContext'

export default function Reports() {
  const { goToDashboard } = useAuth()
  const { board } = useBoard()
  const [timeframe, setTimeframe] = useState('week') // day | week | month

  // Mock data generators
  const mockWeekly = useMemo(() => {
    // last 7 days tasks
    return Array.from({ length: 7 }).map((_, i) => Math.floor(Math.random() * 8) + 1)
  }, [])

  const mockHourly = useMemo(() => {
    // 24 hours distribution
    return Array.from({ length: 24 }).map((_, i) => Math.floor(Math.random() * 3))
  }, [])

  const mockMonthly = useMemo(() => {
    // last 4 weeks
    return Array.from({ length: 4 }).map((_, i) => Math.floor(Math.random() * 40) + 10)
  }, [])

  // Derived quick stats from board (real data)
  const totalTasks = board?.columns?.reduce((s, c) => s + (c.tasks?.length || 0), 0) || 0

  const deployedCol = board?.columns?.find(c => c.title.toLowerCase().includes('deploy') || c.title.toLowerCase().includes('done'))
  const deployedTasksCount = deployedCol?.tasks?.length || 0
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((deployedTasksCount / totalTasks) * 100)

  const devCol = board?.columns?.find(c => c.title.toLowerCase().includes('dev') || c.title.toLowerCase().includes('doing'))

  // Team Leaderboard (Tasks Completed)
  const teamLeaderboard = useMemo(() => {
    const map = {}
    if (deployedCol) {
      deployedCol.tasks.forEach(t => {
        map[t.assignee] = (map[t.assignee] || 0) + 1
      })
    }
    return Object.keys(map).map(k => ({ name: k, tasksCompleted: map[k] })).sort((a,b) => b.tasksCompleted - a.tasksCompleted)
  }, [deployedCol])

  // Bottlenecks (In Development)
  const bottlenecks = useMemo(() => {
    const map = {}
    if (devCol) {
      devCol.tasks.forEach(t => {
        map[t.assignee] = (map[t.assignee] || 0) + 1
      })
    }
    return Object.keys(map)
      .map(k => ({ name: k, tasksInDev: map[k] }))
      .filter(b => b.tasksInDev >= 3)
      .sort((a,b) => b.tasksInDev - a.tasksInDev)
  }, [devCol])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Reports</h1>
        <div>
          <button className={styles.backBtn} onClick={goToDashboard}>← Back</button>
        </div>
      </header>

      <section className={styles.summary}>
        <div className={styles.card} style={{ flex: 1 }}>
          <h3>Project Progress: {completionPercentage}%</h3>
          <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '10px', height: '20px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ width: `${completionPercentage}%`, backgroundColor: '#0078d4', height: '100%', transition: 'width 0.3s ease-in-out' }}></div>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
      </section>

      {bottlenecks.length > 0 && (
        <section className={styles.bottlenecks} style={{ padding: '16px', backgroundColor: 'rgba(215,0,0,0.1)', border: '1px solid rgba(215,0,0,0.5)', borderRadius: '8px', marginBottom: '16px' }}>
          <h2 style={{ color: 'red', marginTop: 0 }}>⚠️ Bottleneck Warnings</h2>
          <ul>
            {bottlenecks.map(b => (
              <li key={b.name} style={{ color: 'red' }}><strong>{b.name}</strong> currently has {b.tasksInDev} tasks stuck "In Development".</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.assignees}>
        <h2>Team Leaderboard (Tasks Completed)</h2>
        <ul>
          {teamLeaderboard.length === 0 ? <li>No tasks deployed yet.</li> : teamLeaderboard.map((a, i) => (
            <li key={a.name}>#{i + 1} <strong>{a.name}</strong> - {a.tasksCompleted} tasks done</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
