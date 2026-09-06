import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage({ initialEnvironment = 'member' }) {
  const { login, register, adminLogin } = useAuth()
  const [mode, setMode] = useState('login')
  const [environment, setEnvironment] = useState(initialEnvironment)
  const [form, setForm] = useState({ username: '', email: import.meta.env.DEV && initialEnvironment === 'admin' ? 'admin' : '', password: import.meta.env.DEV && initialEnvironment === 'admin' ? 'Admin@123' : '', remember: true })
  const [error, setError] = useState(null), [busy, setBusy] = useState(false), [showPassword, setShowPassword] = useState(false)
  const pending = useRef(false)
  const lengthMet = form.password.length >= 8, specialMet = /[^a-zA-Z0-9\s]/.test(form.password)
  const update = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError(null) }
  const switchMode = next => { setMode(next); setError(null); setShowPassword(false); setForm(current => ({ ...current, password: '' })); setEnvironment('member') }
  const changeEnvironment = value => { setEnvironment(value); setError(null); setShowPassword(false); if (import.meta.env.DEV && value === 'admin') setForm(current => ({ ...current, email: 'admin', password: 'Admin@123' })); else if (value === 'demo') setForm(current => ({ ...current, email: 'demo', password: 'Demo@123' })); else if (environment === 'demo' || (import.meta.env.DEV && environment === 'admin')) setForm(current => ({ ...current, email: '', password: '' })) }
  const submit = async event => {
    event.preventDefault(); if (pending.current) return
    if (mode === 'register' && (!lengthMet || !specialMet)) { setError({ field: 'password', text: 'Use at least 8 characters and one special character.' }); return }
    pending.current = true; setBusy(true); setError(null)
    try {
      if (mode === 'register') await register(form.username.trim(), form.email.trim(), form.password)
      else await (environment === 'admin' ? adminLogin : login)(form.email.trim(), form.password, form.remember)
    } catch (err) {
      const text = err.error || err.errors?.[0]?.msg || err.message || 'Sign-in failed. Please try again.'
      const field = err.errors?.[0]?.path || (/email/i.test(text) ? 'email' : mode === 'register' && /username/i.test(text) ? 'username' : 'password')
      setError({ field: ['username', 'email', 'password'].includes(field) ? field : 'password', text })
    } finally { pending.current = false; setBusy(false) }
  }
  const fieldError = field => error?.field === field
  const errorMessage = field => fieldError(field) && <p id={`${field}-error`} className={styles.error} role="alert">{error.text}</p>
  return <main className={styles.authCanvas}>
    <section className={styles.marketing} aria-label="About NovaSync">
      <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true"><i/><i/><i/></span><span>Nova<b>Sync</b></span></div>
      <div className={styles.storyContent}><span className={styles.kicker}>YOUR TEAM. ONE CONNECTED WORKSPACE.</span><h1>One space.<br/>Every idea.<br/><em>In motion.</em></h1><p>Bring projects, people and decisions together. Make room for your next great idea.</p></div>
      <Showcase/>
      <small className={styles.copyright}>© 2026 NovaSync · Work better, together.</small>
    </section>
    <section className={styles.authPane} aria-label="Account access"><div className={styles.authCard}>
      <div className={styles.modeTabs} role="group" aria-label="Account access mode"><button disabled={busy} aria-pressed={mode === 'login'} onClick={() => mode !== 'login' && switchMode('login')}>Sign In</button><button disabled={busy} aria-pressed={mode === 'register'} onClick={() => mode !== 'register' && switchMode('register')}>Create Account</button></div>
      <header className={styles.heading}><span>{mode === 'login' ? 'WELCOME BACK' : 'YOUR NEXT CHAPTER'}</span><h2>{mode === 'login' ? 'Make yourself at home.' : 'Start something great.'}</h2><p>{mode === 'login' ? 'Sign in to continue to your workspace.' : 'Create your account and bring your ideas to life.'}</p></header>
      <form onSubmit={submit}><fieldset disabled={busy}>
        {mode === 'register' && <div className={styles.group}><label htmlFor="username">Username</label><input autoFocus required minLength={2} maxLength={50} id="username" autoComplete="username" placeholder="Your name" value={form.username} aria-invalid={fieldError('username')} aria-describedby={fieldError('username') ? 'username-error' : undefined} onChange={event => update('username', event.target.value)}/>{errorMessage('username')}</div>}
        <div className={styles.group}><label htmlFor="email">{mode === 'login' ? 'Email or username' : 'Email address'}</label><input required id="email" type={mode === 'login' ? 'text' : 'email'} autoComplete={mode === 'login' ? 'username' : 'email'} autoFocus={mode === 'login'} placeholder={mode === 'login' ? 'you@company.com or username' : 'you@company.com'} value={form.email} aria-invalid={fieldError('email')} aria-describedby={fieldError('email') ? 'email-error' : undefined} onChange={event => update('email', event.target.value)}/>{errorMessage('email')}</div>
        <div className={styles.group}><label htmlFor="password">Password</label><div className={styles.passwordWrap}><input required id="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Enter your password" value={form.password} aria-invalid={fieldError('password')} aria-describedby={[mode === 'register' ? 'password-rules' : '', fieldError('password') ? 'password-error' : ''].filter(Boolean).join(' ') || undefined} onChange={event => update('password', event.target.value)}/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div>{errorMessage('password')}
          {mode === 'register' && <ul id="password-rules" className={styles.passwordRules}><li className={lengthMet ? styles.met : ''}><span aria-hidden="true">{lengthMet ? '✓' : '○'}</span>At least 8 characters<span className={styles.srOnly}>{lengthMet ? ' — met' : ' — not met'}</span></li><li className={specialMet ? styles.met : ''}><span aria-hidden="true">{specialMet ? '✓' : '○'}</span>One special character<span className={styles.srOnly}>{specialMet ? ' — met' : ' — not met'}</span></li></ul>}
        </div>
        {mode === 'login' && <><label className={styles.remember}><input type="checkbox" checked={form.remember} onChange={event => update('remember', event.target.checked)}/>Keep me signed in</label><label className={styles.environment}>Sign in as<select value={environment} onChange={event => changeEnvironment(event.target.value)}><option value="member">Workspace member</option><option value="admin">Administrator</option>{import.meta.env.DEV && <option value="demo">Development member · demo</option>}</select></label></>}
        <button className={styles.submit} disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create my account' : 'Sign In'}<span aria-hidden="true">→</span></button>
      </fieldset></form>
      <p className={styles.secure}>◇ {environment === 'admin' ? 'Administrator access requires an assigned admin role.' : 'Your next step starts here.'}</p>
    </div></section>
  </main>
}

function Showcase() {
  const [slide, setSlide] = useState(0), [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false), [paused, setPaused] = useState(false), [reduced, setReduced] = useState(false)
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  useEffect(() => { if (hovered || focused || paused || reduced) return; const timer = setInterval(() => setSlide(value => (value + 1) % 2), 8000); return () => clearInterval(timer) }, [hovered, focused, paused, reduced])
  return <section className={styles.showcase} aria-label="Workspace showcase" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <div className={styles.slides}>
      <article className={`${styles.slide} ${slide === 0 ? styles.visible : ''}`} aria-hidden={slide !== 0}><header><span>PLAN WITH CONTEXT</span><small>Illustrative schedule</small></header><h3>Every milestone. A clear path.</h3><div className={styles.gantt}><div className={styles.axis}><span>LAUNCH PLAN</span><span>W1</span><span>W2</span><span>W3</span><span>W4</span></div>{[['Scope',1,1],['Build',2,2],['Validate',3,1],['Launch',4,1]].map(([label,start,duration], index) => <div className={styles.ganttRow} key={label}><span>{label}</span><div><i style={{ left: `${(start - 1) * 25}%`, width: `${duration * 25 - 3}%` }} className={index === 3 ? styles.milestone : ''}>{index === 3 ? '◆' : ''}</i></div></div>)}</div><footer><span><i/> Example critical path</span><span>◆ Release milestone</span></footer></article>
      <article className={`${styles.slide} ${slide === 1 ? styles.visible : ''}`} aria-hidden={slide !== 1}><header><span>CONNECTED ENVIRONMENTS</span><small>Concept preview · sample data</small></header><h3>A pulse on your physical workspace.</h3><div className={styles.sensorGrid}><div><span>● Shelf A-02</span><strong>23.4<small> °C</small></strong><p>Temperature · Healthy</p><div className={styles.sparkline}>{[35,45,38,52,42,56,48,44,51,46,49,45].map((height,index) => <i key={index} style={{height:`${height}%`}}/>)}</div></div><div><span>● Shelf B-04</span><strong>46<small>%</small></strong><p>Humidity · Healthy</p><div className={styles.sensorStatus}>✓ Within example range</div></div></div><footer>Illustrative monitoring integration · not a live connection</footer></article>
    </div>
    <div className={styles.carouselControls}><div>{['Schedule preview','Environment preview'].map((label,index) => <button key={label} aria-label={`Show ${label}`} aria-pressed={slide === index} onClick={() => setSlide(index)}/>)}</div><button className={styles.pause} aria-label={paused ? 'Resume showcase' : 'Pause showcase'} onClick={() => setPaused(value => !value)}>{paused ? '▶' : 'Ⅱ'}</button></div>
  </section>
}
