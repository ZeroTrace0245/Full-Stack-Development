import { useEffect, useRef, useState } from 'react'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import styles from './TeamMembers.module.css'

const EMPTY_MEMBER = { username: '', email: '', password: '', role: 'Standard User' }
const initials = name => (name || 'TM').split(/[ _-]/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase()
const errorMessage = err => err.error || err.errors?.[0]?.msg || err.message || 'Could not complete this request.'

export default function TeamMembers() {
  const { user, goToChat } = useAuth()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All')
  const [sort, setSort] = useState('name')
  const [invite, setInvite] = useState(false)
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [form, setForm] = useState(EMPTY_MEMBER)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [menu, setMenu] = useState(null)
  const pending = useRef(false)
  const isAdmin = user?.role === 'Admin'

  useEffect(() => { let alive = true; apiClient.getAllUsers().then(result=>{if(alive)setTeam(result.users || [])}).catch(err=>{if(alive)setError(errorMessage(err))}).finally(()=>{if(alive)setLoading(false)}); return ()=>{alive=false} }, [])
  useEffect(() => {
    if (!menu) return
    const close = event => { if (!event.target.closest('[data-member-actions]')) setMenu(null) }
    const escape = event => { if(event.key==='Escape')setMenu(null) }
    document.addEventListener('pointerdown',close); document.addEventListener('keydown',escape)
    return ()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)}
  }, [menu])
  const filtered = team.filter(member=>(role==='All'||member.role===role)&&`${member.username} ${member.email}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>sort==='newest'?(new Date(b.createdAt).getTime()||0)-(new Date(a.createdAt).getTime()||0):(a.username||'').localeCompare(b.username||''))
  const openInvite = () => { setEditing(null); setForm(EMPTY_MEMBER); setFormError(''); setInvite(true) }
  const editRole = member => { setMenu(null);setEditing(member);setForm({...EMPTY_MEMBER,...member,password:''});setFormError('');setInvite(true) }
  const closeInvite = () => { if(!pending.current)setInvite(false) }
  const submit = async event => {
    event.preventDefault();if(pending.current)return
    pending.current=true;setSaving(true);setFormError('')
    try {
      const result = editing ? await apiClient.updateUserRole(editing.id,form.role) : await apiClient.createUser({...form,username:form.username.trim(),email:form.email.trim()})
      setTeam(current=>editing?current.map(member=>member.id===editing.id?result.user:member):[...current,result.user])
      setNotice(editing?'Member role updated.':'Member account created. Share their temporary password securely.');setInvite(false);setForm(EMPTY_MEMBER)
    } catch(err) { setFormError(errorMessage(err)) }
    finally {pending.current=false;setSaving(false)}
  }
  const remove = async () => {
    await apiClient.deleteUser(removing.id)
    setTeam(current=>current.filter(member=>member.id!==removing.id));setNotice('Member account removed.');setRemoving(null)
  }
  return <div className={styles.container}>
    <header className={styles.header}><div><span className={styles.eyebrow}>WORKSPACE DIRECTORY</span><h1>Team Members</h1><p>Find teammates and manage workspace access.</p></div><button onClick={goToChat}>Open messages</button></header>
    <section className={styles.filterBar} aria-label="Member search and filters">
      <label className={styles.search}>Search members<input type="search" placeholder="Search by name or email…" value={query} onChange={event=>setQuery(event.target.value)}/></label>
      <label>Role<select value={role} onChange={event=>setRole(event.target.value)}><option value="All">All roles</option><option>Admin</option><option>Standard User</option></select></label>
      <label>Sort by<select value={sort} onChange={event=>setSort(event.target.value)}><option value="name">Name A–Z</option><option value="newest">Newest first</option></select></label>
      {(query||role!=='All')&&<button onClick={()=>{setQuery('');setRole('All')}}>Clear filters</button>}
      {isAdmin&&<button className={styles.inviteBtn} onClick={openInvite}>＋ Invite Member</button>}
    </section>
    <div className={styles.summary}><span role="status">{loading?'Loading members…':`${filtered.length} of ${team.length} members`}</span><span><i/>Active accounts</span></div>
    {error&&<p className={styles.error} role="alert">{error}</p>}{notice&&<p className={styles.notice} role="status">{notice}</p>}
    <section className={styles.directory} aria-label="Team directory"><div className={styles.tableScroll} tabIndex="0" aria-label="Scrollable member directory"><table><thead><tr><th scope="col">User Profile</th><th scope="col">Role</th><th scope="col">Date Added</th>{isAdmin&&<th scope="col"><span className={styles.srOnly}>Actions</span></th>}</tr></thead><tbody>
      {loading||!filtered.length ? <tr><td colSpan={isAdmin?4:3} className={styles.empty}><strong>{loading?'Loading your team…':error?'Directory unavailable':team.length?'No matching members':'Your directory is empty'}</strong><p>{loading?'Fetching workspace accounts.':error?'Try refreshing the page.':team.length?'Try another name, email, or role filter.':'Invite a member to start collaborating.'}</p></td></tr> : filtered.map(member=><tr key={member.id}>
        <td><div className={styles.person}><div className={styles.avatar}>{member.avatar?<img src={member.avatar} alt=""/>:initials(member.username)}</div><div><strong>{member.username}{member.id===user?.id&&<em>You</em>}</strong><small>{member.email}</small></div></div></td>
        <td><span className={`${styles.role} ${member.role==='Admin'?styles.admin:''}`}><i aria-hidden="true"/>{member.role}</span><small className={styles.accountState}>Active account</small></td>
        <td><time dateTime={member.createdAt}>{member.createdAt?new Date(member.createdAt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'Not available'}</time></td>
        {isAdmin&&<td className={styles.actionCell}><div data-member-actions><button className={styles.more} aria-label={`More options for ${member.username}`} aria-expanded={menu===member.id} onClick={()=>setMenu(menu===member.id?null:member.id)}>⋮</button>{menu===member.id&&<div className={styles.rowMenu}><button disabled={member.id===user?.id} onClick={()=>editRole(member)}>Edit role</button><button disabled={member.id===user?.id} className={styles.remove} onClick={()=>{setRemoving(member);setMenu(null)}}>Remove account</button>{member.id===user?.id&&<small>You cannot change your own admin access here.</small>}</div>}</div></td>}
      </tr>)}
    </tbody></table></div></section>
    <Modal isOpen={invite} title={editing?'Edit member role':'Invite Member'} onClose={closeInvite} compact>
      <form className={styles.memberForm} onSubmit={submit}><div className={styles.formBody}><p>{editing?`Update workspace access for ${editing.username}.`:'Create a member account with a temporary password. No invitation email is sent automatically.'}</p><fieldset disabled={saving} className={styles.formGrid}>
        {!editing&&<><label>Name<input autoFocus required minLength="2" maxLength="50" autoComplete="off" value={form.username} onChange={event=>setForm({...form,username:event.target.value})} placeholder="Full name or username"/></label><label>Email<input required type="email" autoComplete="off" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="name@company.com"/></label></>}
        <label>Role<select autoFocus={Boolean(editing)} value={form.role} onChange={event=>setForm({...form,role:event.target.value})}><option>Standard User</option><option>Admin</option></select></label>
        {!editing&&<label>Temporary password<input required type="password" minLength="6" autoComplete="new-password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})} placeholder="At least 6 characters"/></label>}
      </fieldset>{formError&&<p className={styles.error} role="alert">{formError}</p>}</div><footer><button type="button" disabled={saving} onClick={closeInvite}>Cancel</button><button className={styles.inviteBtn} disabled={saving}>{saving?'Saving…':editing?'Save role':'Create member'}</button></footer></form>
    </Modal>
    <ConfirmDialog isOpen={Boolean(removing)} title="Remove Member" message="This account will be deleted and its locked task assignments released." itemLabel="account" taskName={removing?.username} confirmText="Remove Member" isDangerous onCancel={()=>setRemoving(null)} onConfirm={remove}/>
  </div>
}
