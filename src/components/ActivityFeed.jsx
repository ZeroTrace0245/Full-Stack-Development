import React from 'react'
import { useBoard } from '../context/BoardContext'
import styles from './ActivityFeed.module.css'

function timeAgo(ts) {
  const now = Date.now()
  const diff = Math.floor((now - new Date(ts).getTime()) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ActivityFeed() {
  const { activities } = useBoard()

  return (
    <div className={styles.feed}>
      <h3 className={styles.title}>Activity</h3>
      <div className={styles.list}>
        {activities.map((act) => (
          <div key={act.id} className={styles.item}>
            <div className={styles.time}>{timeAgo(act.timestamp)}</div>
            <div className={styles.text}>{act.text}</div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className={styles.empty}>No activity yet.</p>
        )}
      </div>
    </div>
  )
}
