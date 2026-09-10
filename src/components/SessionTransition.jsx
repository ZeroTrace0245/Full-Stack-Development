import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './SessionTransition.module.css'

const messages = {
  boot: ['Starting NovaSync', 'A little space for your next big idea.'],
  login: ['Welcome back', 'Opening your workspace.'],
  logout: ['You’re signed out', 'See you next time.'],
}

export default function SessionTransition({ children }) {
  const { transition, clearTransition, isLoading } = useAuth()
  return transition || isLoading
    ? <TransitionScreen key={transition || 'boot'} mode={transition || 'boot'} ready={!isLoading} onComplete={clearTransition} />
    : <div className={styles.reveal}>{children}</div>
}

function TransitionScreen({ mode, ready, onComplete }) {
  const [elapsed, setElapsed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timer = setTimeout(() => setElapsed(true), media.matches ? 0 : mode === 'boot' ? 1300 : 850)
    const reduce = () => { if (media.matches) setElapsed(true) }
    media.addEventListener('change', reduce)
    return () => { clearTimeout(timer); media.removeEventListener('change', reduce) }
  }, [mode])
  useEffect(() => {
    if (!elapsed || !ready) return
    setLeaving(true)
    const timer = setTimeout(onComplete, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240)
    return () => clearTimeout(timer)
  }, [elapsed, ready, onComplete])
  const [title, subtitle] = messages[mode]
  return <main className={`${styles.screen} ${leaving ? styles.leaving : ''}`} data-session-transition={mode}>
    <div className={styles.glow} aria-hidden="true" />
    <div className={styles.content} role="status" aria-live="polite">
      <div className={`${styles.emblem} ${mode === 'logout' ? styles.signout : ''}`} aria-hidden="true">
        <div className={styles.orbit} /><span className={styles.mark}><i /><i /><i /></span>
      </div>
      <div className={styles.wordmark}>Nova<b>Sync</b></div>
      <h1>{title}</h1><p>{subtitle}</p>
      <div className={styles.track} aria-hidden="true"><span /></div>
      <small>WORK BETTER, TOGETHER.</small>
    </div>
  </main>
}
