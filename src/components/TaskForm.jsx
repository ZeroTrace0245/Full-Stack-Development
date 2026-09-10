import { useEffect, useRef, useState } from 'react'
import { readPreference, writePreference } from '../utils/preferences'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'
import TaskDescription from './TaskDescription'
import styles from './TaskForm.module.css'

export default function TaskForm({ columns, selectedColumn, onSubmit, onCancel, editingTask, onBusyChange, onDirtyChange }) {
  const { user } = useAuth()
  const pending = useRef(false)
  const defaults = readPreference(`task-defaults-${user?.id}`, {})
  const [fieldErrors, setFieldErrors] = useState({})
  const [members, setMembers] = useState([])
  const [usersError, setUsersError] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const draftKey = `novasync-draft-${user?.id}-${editingTask?.id || 'new'}`
  const [draft] = useState(() => { try { return JSON.parse(localStorage.getItem(draftKey)) } catch { return null } })
  const [comment, setComment] = useState(draft?.comment || '')
  const [form, setForm] = useState(() => ({
    title: editingTask?.title || '', description: editingTask?.description || '', descriptionHtml: editingTask?.descriptionHtml || '',
    assignee: editingTask ? (editingTask.assignee || '') : (defaults.assignee || ''), estimate: editingTask?.estimate ?? 2, priority: editingTask?.priority || defaults.priority || 'Medium', type: editingTask?.type || defaults.type || 'Feature',
    columnId: editingTask?.columnId || selectedColumn?.id || columns[0]?.id || '',
    startDate: editingTask?.startDate || '', endDate: editingTask?.endDate || editingTask?.dueDate || '', milestone: Boolean(editingTask?.milestone),
    blockedBy: editingTask?.blockedBy || (editingTask?.relationship === 'depends-on' && editingTask.relatedTaskId ? [editingTask.relatedTaskId] : []),
    blocking: editingTask?.blocking || (editingTask?.relationship === 'blocks' && editingTask.relatedTaskId ? [editingTask.relatedTaskId] : []),
    labels: (editingTask?.labels || []).join(', '), subtasks: (editingTask?.subtasks || []).map(item=>({...item, key: crypto.randomUUID()}))
  }))
  const initial = useRef(JSON.stringify({ form, comment: '' }))
  const [editorSeed, setEditorSeed] = useState(() => ({ html: draft?.form?.descriptionHtml ?? form.descriptionHtml, text: draft?.form?.description ?? form.description }))
  const [restored, setRestored] = useState(Boolean(draft?.form))
  const [editorVersion, setEditorVersion] = useState(0)
  const saved = useRef(false)
  const dirty = restored || JSON.stringify({ form, comment }) !== initial.current
  useEffect(() => { if (draft?.form) setForm(current => ({ ...current, ...draft.form })) }, [draft])
  useEffect(() => {
    onDirtyChange?.(dirty)
    if (!saved.current && dirty) { try { localStorage.setItem(draftKey, JSON.stringify({ form, comment })) } catch { setError('Draft could not be stored in this browser. Keep this form open until saved.') } }
    if (!dirty) { try { localStorage.removeItem(draftKey) } catch { /* optional storage */ } }
  }, [form, comment, dirty, draftKey, onDirtyChange])
  useEffect(() => {
    if (!dirty) return
    const leave = event => { if (!saved.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', leave)
    return () => window.removeEventListener('beforeunload', leave)
  }, [dirty])
  const discardDraft = () => {
    const original = JSON.parse(initial.current); setForm(original.form); setComment(''); setRestored(false)
    setEditorSeed({ html: original.form.descriptionHtml, text: original.form.description })
    setEditorVersion(value => value + 1)
    try { localStorage.removeItem(draftKey) } catch { /* optional storage */ }
  }
  useEffect(() => { let alive = true; apiClient.getAllUsers().then(({users=[]})=>{if(alive)setMembers(users)}).catch(err=>{if(alive)setUsersError(err.error || err.message || 'Could not load members')}); return ()=>{alive=false} }, [])
  const update = (name,value) => setForm(current=>({...current,[name]:value}))
  const change = event => update(event.target.name,event.target.type==='checkbox'?event.target.checked:event.target.value)
  const tasks = columns.flatMap(column=>column.tasks).filter(task=>task.id!==editingTask?.id)
  const completed = form.subtasks.filter(item=>item.completed).length
  const progress = form.subtasks.length ? Math.round(completed/form.subtasks.length*100) : 0
  const submit = async event => {
    event.preventDefault(); if (pending.current) return
    const errors = {}
    if (!form.title.trim()) errors.title = 'Enter a task title.'
    if (!Number.isFinite(Number(form.estimate)) || Number(form.estimate)<0.5 || Number(form.estimate)>1000) errors.estimate = 'Enter an estimate between 0.5 and 1000 hours.'
    if (form.startDate && form.endDate && form.startDate>form.endDate) errors.endDate = 'End date must be on or after start date.'
    if (form.subtasks.some(item=>!item.title.trim())) errors.subtasks = 'Give each subtask a title or remove it.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) { event.currentTarget.elements.namedItem(Object.keys(errors)[0])?.focus(); return }
    if(form.startDate && form.endDate && form.startDate>form.endDate) return setError('End date must be on or after start date.')
    if(form.blockedBy.some(id=>form.blocking.includes(id))) return setError('A task cannot both block and be blocked by the same task.')
    pending.current=true;setBusy(true);onBusyChange?.(true);setError('')
    try {
      await onSubmit({...form, id:editingTask?.id, title:form.title.trim(), estimate:Number(form.estimate), dueDate:form.endDate,
        relationship: ['related-to','duplicate-of'].includes(editingTask?.relationship) ? editingTask.relationship : '',
        relatedTaskId: ['related-to','duplicate-of'].includes(editingTask?.relationship) ? editingTask.relatedTaskId : '',
        labels:form.labels.split(',').map(label=>label.trim()).filter(Boolean).slice(0,5), progress,
        subtasks:form.subtasks.map(({title,completed})=>({title:title.trim(),completed})),
        comments:[...(editingTask?.comments || []), ...(comment.trim() ? [`${user?.username || 'Member'} · ${new Date().toISOString()}\n${comment.trim()}`] : [])]
      })
      saved.current = true; onDirtyChange?.(false)
      try { localStorage.removeItem(draftKey) } catch { /* optional storage */ }
      writePreference(`task-defaults-${user?.id}`, { assignee: form.assignee, priority: form.priority, type: form.type })
    } catch(err) { setError(err.error || err.errors?.[0]?.msg || err.message || 'Could not save task. Your changes are still here.') }
    finally { pending.current=false;setBusy(false);onBusyChange?.(false) }
  }
  const input = (name,label,type='text',extra={}) => <label>{label}<input name={name} type={type} value={form[name]} onChange={change} aria-invalid={Boolean(fieldErrors[name])} aria-describedby={fieldErrors[name]?`error-${name}`:undefined} {...extra}/>{fieldErrors[name]&&<small id={`error-${name}`} role="alert">{fieldErrors[name]}</small>}</label>
  const select = (name,label,options) => <label>{label}<select name={name} value={form[name]} onChange={change}>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>
  const dependency = (name,label) => <label>{label}<select multiple aria-label={label} value={form[name]} onChange={event=>update(name,Array.from(event.target.selectedOptions,option=>option.value))}>{[...tasks.map(task=>[task.id,task.title]),...form[name].filter(id=>!tasks.some(task=>task.id===id)).map(id=>[id,`Unavailable task (${id})`])].map(([id,title])=><option key={id} value={id}>{title}</option>)}</select><small>Ctrl / Cmd-click to select multiple tasks.</small>{form[name].length>0&&<button type="button" onClick={()=>update(name,[])}>Clear dependencies</button>}</label>
  return <form className={styles.form} onSubmit={submit} aria-busy={busy} onKeyDown={event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();event.currentTarget.requestSubmit()}}}>
    <div className={styles.scrollBody}>{dirty && <p role="status">{restored ? 'Recovered your unfinished draft.' : 'Draft saved on this device.'} <button type="button" disabled={busy} onClick={discardDraft}>Discard draft</button></p>}<fieldset disabled={busy} className={styles.grid}>
      <div className={styles.contentColumn}>
        {input('title','Task title','text',{required:true,maxLength:240,autoFocus:true})}
        <div className={styles.group}><h3>Description</h3><TaskDescription key={editorVersion} disabled={busy} initialHtml={editorSeed.html} initialText={editorSeed.text} onChange={(description,descriptionHtml)=>setForm(current=>({...current,description,descriptionHtml}))}/></div>
        <section className={styles.subtasks}>{fieldErrors.subtasks&&<p role="alert">{fieldErrors.subtasks}</p>}<div className={styles.sectionHeading}><h3>Subtasks</h3><button type="button" onClick={()=>update('subtasks',[...form.subtasks,{key:crypto.randomUUID(),title:'',completed:false}])}>+ Add subtask</button></div>
          {form.subtasks.length ? form.subtasks.map(item=><div className={styles.subtaskRow} key={item.key}><input type="checkbox" aria-label={`Complete ${item.title || 'subtask'}`} checked={item.completed} onChange={event=>update('subtasks',form.subtasks.map(row=>row.key===item.key?{...row,completed:event.target.checked}:row))}/><input required aria-label="Subtask title" value={item.title} placeholder="What needs to be done?" onChange={event=>update('subtasks',form.subtasks.map(row=>row.key===item.key?{...row,title:event.target.value}:row))}/><button type="button" aria-label={`Remove ${item.title || 'subtask'}`} onClick={()=>update('subtasks',form.subtasks.filter(row=>row.key!==item.key))}>×</button></div>) : <p>Add smaller steps to track this task automatically.</p>}
          <div className={styles.progressSummary}><span>{completed} of {form.subtasks.length} completed</span><output aria-label="Subtask progress">{progress}%</output></div><progress max="100" value={progress}/>
        </section>
        {editingTask && <section className={styles.activity}><h3>Activity & comments</h3><div className={styles.activityFeed}>{editingTask.createdAt && <p>Created {new Date(editingTask.createdAt).toLocaleString()}</p>}{editingTask.updatedAt && <p>Last updated {new Date(editingTask.updatedAt).toLocaleString()}</p>}{(editingTask.comments || []).map((text,index)=><article key={index}>{text}</article>)}{!editingTask.comments?.length && <p>No comments yet. Keep the conversation with this task.</p>}</div><label>Add a comment<textarea value={comment} onChange={event=>setComment(event.target.value)} maxLength="2000" rows="3" placeholder="Share context or an update…"/></label><small>Your comment is posted when you save the task.</small></section>}
      </div>
      <aside className={styles.metadataColumn}><h3>Task details</h3>
        {select('assignee','Assignee',[['','Unassigned'],...members.map(member=>[member.username,member.username]),...(form.assignee&&!members.some(member=>member.username===form.assignee)?[[form.assignee,form.assignee]]:[])])}{usersError&&<p role="status">{usersError}</p>}
        {select('columnId','Column status',columns.map(column=>[column.id,column.title]))}
        {select('priority','Priority',['Low','Medium','High'].map(value=>[value,value]))}
        {select('type','Task type',['Feature','Bug','UI'].map(value=>[value,value]))}
        {input('labels','Labels','text',{placeholder:'frontend, launch, customer',list:'recent-labels'})}<datalist id="recent-labels">{[...new Set(tasks.flatMap(task=>task.labels||[]))].map(label=><option key={label} value={label}/>)}</datalist>
        {input('estimate','Estimate (hours)','number',{min:.5,max:1000,step:.5,required:true})}
        <h3>Schedule</h3>{input('startDate','Start date','date')}{input('endDate','End date','date',{min:form.startDate || undefined})}
        <label className={styles.milestone}><span>Milestone<small>A key checkpoint in your schedule</small></span><input type="checkbox" role="switch" name="milestone" checked={form.milestone} onChange={change}/></label>
        <h3>Dependencies</h3>{dependency('blockedBy','Blocked by')}{dependency('blocking','Blocking')}
      </aside>
    </fieldset></div>
    <footer className={styles.actions}>{error&&<p role="alert">{error}</p>}<span>{editingTask?'Changes are saved to this task.':'Create a task for your team.'}</span><div><button type="button" onClick={onCancel} disabled={busy}>Cancel</button><button type="submit" className={styles.save} disabled={busy}>{busy?'Saving…':'Save Task'}</button></div></footer>
  </form>
}
