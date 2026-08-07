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

export default function Reports({ board }) {
  const { goToDashboard } = useAuth()
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
  const totalEstimate = board?.columns?.reduce((s, c) => s + c.tasks.reduce((r, t) => r + (t.estimate || 0), 0), 0) || 0

  // Assignee hours (real data)
  const perAssignee = useMemo(() => {
    const map = {}
    board?.columns?.forEach(c => c.tasks.forEach(t => {
      map[t.assignee] = (map[t.assignee] || 0) + (t.estimate || 0)
    }))
    return Object.keys(map).map(k => ({ name: k, hours: map[k] })).sort((a,b) => b.hours - a.hours)
  }, [board])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Reports</h1>
        <div>
          <button className={styles.backBtn} onClick={goToDashboard}>← Back</button>
        </div>
      </header>

      <section className={styles.summary}>
        <div className={styles.card}>
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Estimate (hours)</h3>
          <p>{totalEstimate}</p>
        </div>
      </section>

      <section className={styles.charts}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Tasks over last 7 days</h3>
            <div className={styles.smallNote}>mock data</div>
          </div>
          <BarChart data={mockWeekly} labels={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']} />
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Weekly Estimates (last 4 weeks)</h3>
            <div className={styles.smallNote}>mock data</div>
          </div>
          <BarChart data={mockMonthly} labels={['W1','W2','W3','W4']} color="#6c5ce7" />
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Hourly workload (24h)</h3>
            <div className={styles.smallNote}>mock data</div>
          </div>
          <LineChart data={mockHourly} />
        </div>
      </section>

      <section className={styles.assignees}>
        <h2>Top Assignees (hours)</h2>
        <ul>
          {perAssignee.slice(0, 10).map(a => (
            <li key={a.name}>{a.name}: {a.hours}h</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
