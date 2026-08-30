import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

const Icon = ({ children, size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
const Check = () => <Icon size={15}><path d="M20 6 9 17l-5-5"/></Icon>

export default function LoginPage() {
  const { login, register, goToAdminLogin } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '', remember: true })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const update = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError('') }
  const switchMode = () => { setMode(current => current === 'login' ? 'register' : 'login'); setError(''); setShowPassword(false) }
  const submit = async event => {
    event.preventDefault()
    if (!form.email.trim() || !form.password || (mode === 'register' && !form.username.trim())) return setError('Please complete all required fields.')
    if (mode === 'register' && form.password.length < 6) return setError('Password must contain at least 6 characters.')
    setBusy(true); setError('')
    try {
      if (mode === 'register') await register(form.username.trim(), form.email.trim(), form.password)
      else await login(form.email.trim(), form.password, form.remember)
    } catch (err) { setError(err.error || err.errors?.[0]?.msg || err.message || 'Authentication failed. Please try again.') }
    finally { setBusy(false) }
  }

  return <main className={styles.page}>
    <section className={styles.story}>
      <div className={styles.aurora}/><div className={styles.grid}/>
      <div className={styles.brand}><span className={styles.brandMark}><i/><i/><i/></span><span>Nova<b>Sync</b></span></div>
      <div className={styles.storyContent}>
        <span className={styles.kicker}><i/> Built for teams that move fast</span>
        <h1>One space.<br/>Every idea.<br/><em>In motion.</em></h1>
        <p>Plan projects, align your team, and turn ambitious ideas into meaningful progress—all in one beautifully simple workspace.</p>
        <div className={styles.features}>
          <span><i><Check/></i> Visual project boards</span><span><i><Check/></i> Real-time collaboration</span><span><i><Check/></i> Clear progress insights</span>
        </div>
      </div>
      <div className={styles.preview} aria-hidden="true">
        <div className={styles.previewTop}><span/><span/><span/><i/></div>
        <div className={styles.previewBody}><div className={styles.previewSide}><b/><b/><b/><b/></div><div className={styles.previewMain}><div className={styles.previewTitle}/><div className={styles.previewStats}><i/><i/><i/></div><div className={styles.previewBars}><span/><span/><span/></div></div></div>
      </div>
      <p className={styles.copyright}>© 2026 NovaSync. Work better, together.</p>
    </section>

    <section className={styles.authSide}>
      <div className={styles.mobileBrand}><span className={styles.brandMark}><i/><i/><i/></span><span>Nova<b>Sync</b></span></div>
      <div className={styles.authCard}>
        <div className={styles.heading}><span>{mode === 'login' ? 'WELCOME BACK' : 'JOIN NOVASYNC'}</span><h2>{mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace'}</h2><p>{mode === 'login' ? 'Enter your details to continue where you left off.' : 'Start organizing your team and projects in minutes.'}</p></div>
        <div className={styles.modeTabs}><button type="button" className={mode === 'login' ? styles.active : ''} onClick={() => mode !== 'login' && switchMode()}>Sign in</button><button type="button" className={mode === 'register' ? styles.active : ''} onClick={() => mode !== 'register' && switchMode()}>Create account</button></div>
        {mode === 'login' && <button type="button" className={styles.adminDemo} onClick={goToAdminLogin}><span>◆</span><span><strong>Administrator portal</strong><small>Use the separate secure admin sign in</small></span><b>Open portal →</b></button>}
        {error && <div className={styles.error} role="alert"><span>!</span>{error}</div>}
        <form onSubmit={submit}>
          {mode === 'register' && <div className={styles.group}><label htmlFor="username">Username</label><div className={styles.inputWrap}><Icon size={18}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon><input id="username" autoComplete="username" placeholder="Choose a username" value={form.username} onChange={e => update('username', e.target.value)} autoFocus/></div></div>}
          <div className={styles.group}><label htmlFor="email">{mode === 'login' ? 'Email or username' : 'Email address'}</label><div className={styles.inputWrap}><Icon size={18}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></Icon><input id="email" type={mode === 'login' ? 'text' : 'email'} autoComplete={mode === 'login' ? 'username' : 'email'} placeholder={mode === 'login' ? 'you@company.com or username' : 'you@company.com'} value={form.email} onChange={e => update('email', e.target.value)} autoFocus={mode === 'login'}/></div></div>
          <div className={styles.labelRow}><label htmlFor="password">Password</label>{mode === 'login' && <button type="button">Forgot password?</button>}</div>
          <div className={styles.inputWrap}><Icon size={18}><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></Icon><input id="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'} value={form.password} onChange={e => update('password', e.target.value)}/><button className={styles.show} type="button" onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div>
          {mode === 'login' && <label className={styles.remember}><input type="checkbox" checked={form.remember} onChange={e => update('remember', e.target.checked)}/><span>Keep me signed in</span></label>}
          {mode === 'register' && <p className={styles.terms}>By creating an account, you agree to our <button type="button">Terms</button> and <button type="button">Privacy Policy</button>.</p>}
          <button className={styles.submit} disabled={busy}>{busy ? <><i/> Please wait…</> : <>{mode === 'login' ? 'Sign in to NovaSync' : 'Create my account'}<Icon size={18}><path d="M5 12h14m-6-6 6 6-6 6"/></Icon></>}</button>
        </form>
        <div className={styles.secure}><Icon size={14}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></Icon> Secure authentication · Your data stays private</div>
      </div>
    </section>
  </main>
}
