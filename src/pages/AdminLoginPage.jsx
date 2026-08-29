import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AdminLoginPage.module.css'

const Icon=({children,size=19})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>

export default function AdminLoginPage(){
  const {adminLogin,goToLogin}=useAuth(); const [form,setForm]=useState({identifier:'',password:'',remember:true}); const [show,setShow]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState('')
  const update=(key,value)=>{setForm(current=>({...current,[key]:value}));setError('')}
  const submit=async event=>{event.preventDefault();if(!form.identifier.trim()||!form.password)return setError('Enter your administrator ID and password.');setBusy(true);setError('');try{await adminLogin(form.identifier.trim(),form.password,form.remember)}catch(err){setError(err.error||err.message||'Administrator sign in failed.')}finally{setBusy(false)}}
  const useDemo=()=>setForm(current=>({...current,identifier:'admin',password:'Admin@123'}))
  return <main className={styles.page}>
    <div className={styles.grid}/><div className={styles.glow}/>
    <button className={styles.back} onClick={goToLogin}><Icon size={16}><path d="M19 12H5m6 6-6-6 6-6"/></Icon> Member sign in</button>
    <section className={styles.portalIntro}><div className={styles.brand}><span className={styles.brandMark}><i/><i/><i/></span><span>Nova<b>Sync</b></span></div><div className={styles.shield}><Icon size={52}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></Icon></div><span className={styles.classification}>RESTRICTED ACCESS</span><h1>Administrator<br/>Control Portal</h1><p>Secure access for workspace administrators. Manage accounts, roles, project health, and system controls.</p><div className={styles.security}><span><Icon size={15}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon> Role-verified access</span><span><Icon size={15}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon> Session monitoring</span></div></section>
    <section className={styles.loginCard}><div className={styles.cardTop}><span>◆ ADMIN CONSOLE</span><h2>Verify your identity</h2><p>Sign in with an account assigned the Administrator role.</p></div>
      {import.meta.env.DEV&&<button className={styles.demo} type="button" onClick={useDemo}><span><strong>Development administrator</strong><small>admin · Admin@123</small></span><b>Use credentials</b></button>}
      {error&&<div className={styles.error} role="alert"><b>!</b>{error}</div>}
      <form onSubmit={submit}><label htmlFor="admin-id">Administrator ID</label><div className={styles.input}><Icon><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon><input id="admin-id" autoFocus autoComplete="username" placeholder="Username or admin email" value={form.identifier} onChange={e=>update('identifier',e.target.value)}/></div><label htmlFor="admin-password">Password</label><div className={styles.input}><Icon><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></Icon><input id="admin-password" type={show?'text':'password'} autoComplete="current-password" placeholder="Enter administrator password" value={form.password} onChange={e=>update('password',e.target.value)}/><button type="button" onClick={()=>setShow(value=>!value)}>{show?'Hide':'Show'}</button></div><label className={styles.remember}><input type="checkbox" checked={form.remember} onChange={e=>update('remember',e.target.checked)}/><span>Keep this admin session active</span></label><button className={styles.submit} disabled={busy}>{busy?<><i/> Verifying access…</>:<>Enter control center <Icon size={17}><path d="M5 12h14m-6-6 6 6-6 6"/></Icon></>}</button></form>
      <div className={styles.notice}><Icon size={14}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon> Unauthorized access attempts may be logged.</div>
    </section>
  </main>
}
