import { useEffect, useState } from 'react'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'
import TaskDescription from './TaskDescription'
import styles from './TaskForm.module.css'

export default function TaskForm({ columns, selectedColumn, onSubmit, onCancel, editingTask }) {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [usersError, setUsersError] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [form, setForm] = useState(() => ({
    title: editingTask?.title || '', description: editingTask?.description || '', descriptionHtml: editingTask?.descriptionHtml || '',
    assignee: editingTask?.assignee || '', estimate: editingTask?.estimate ?? 2, priority: editingTask?.priority || 'Medium', type: editingTask?.type || 'Feature',
    columnId: editingTask?.columnId || selectedColumn?.id || columns[0]?.id || '',
    startDate: editingTask?.startDate || '', endDate: editingTask?.endDate || editingTask?.dueDate || '', milestone: Boolean(editingTask?.milestone),
    blockedBy: editingTask?.blockedBy || (editingTask?.relationship === 'depends-on' && editingTask.relatedTaskId ? [editingTask.relatedTaskId] : []),
    blocking: editingTask?.blocking || (editingTask?.relationship === 'blocks' && editingTask.relatedTaskId ? [editingTask.relatedTaskId] : []),
    labels: (editingTask?.labels || []).join(', '), subtasks: (editingTask?.subtasks || []).map(item=>({...item, key: crypto.randomUUID()}))
  }))
  useEffect(() => { let alive = true; apiClient.getAllUsers().then(({users=[]})=>{if(alive)setMembers(users)}).catch(err=>{if(alive)setUsersError(err.error || err.message || 'Could not load members')}); return ()=>{alive=false} }, [])
  const update = (name,value) => setForm(current=>({...current,[name]:value}))
  const change = event => update(event.target.name,event.target.type==='checkbox'?event.target.checked:event.target.value)
  const tasks = columns.flatMap(column=>column.tasks).filter(task=>task.id!==editingTask?.id)
  const completed = form.subtasks.filter(item=>item.completed).length
  const progress = form.subtasks.length ? Math.round(completed/form.subtasks.length*100) : 0
  const submit = async event => {
    event.preventDefault(); if (busy) return
    if(form.startDate && form.endDate && form.startDate>form.endDate) return setError('End date must be on or after start date.')
    if(form.blockedBy.some(id=>form.blocking.includes(id))) return setError('A task cannot both block and be blocked by the same task.')
    setBusy(true);setError('')
    try {
      await onSubmit({...form, id:editingTask?.id, title:form.title.trim(), estimate:Number(form.estimate), dueDate:form.endDate,
        relationship: ['related-to','duplicate-of'].includes(editingTask?.relationship) ? editingTask.relationship : '',
        relatedTaskId: ['related-to','duplicate-of'].includes(editingTask?.relationship) ? editingTask.relatedTaskId : '',
        labels:form.labels.split(',').map(label=>label.trim()).filter(Boolean).slice(0,5), progress,
        subtasks:form.subtasks.map(({title,completed})=>({title:title.trim(),completed})),
        comments:[...(editingTask?.comments || []), ...(comment.trim() ? [`${user?.username || 'Member'} · ${new Date().toISOString()}\n${comment.trim()}`] : [])]
      })
    } catch(err) { setError(err.error || err.errors?.[0]?.msg || err.message || 'Could not save task. Your changes are still here.') }
    finally { setBusy(false) }
  }
  const input = (name,label,type='text',extra={}) => <label>{label}<input name={name} type={type} value={form[name]} onChange={change} {...extra}/></label>
  const select = (name,label,options) => <label>{label}<select name={name} value={form[name]} onChange={change}>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>
  const dependency = (name,label) => <label>{label}<select multiple aria-label={label} value={form[name]} onChange={event=>update(name,Array.from(event.target.selectedOptions,option=>option.value))}>{[...tasks.map(task=>[task.id,task.title]),...form[name].filter(id=>!tasks.some(task=>task.id===id)).map(id=>[id,`Unavailable task (${id})`])].map(([id,title])=><option key={id} value={id}>{title}</option>)}</select><small>Ctrl / Cmd-click to select multiple tasks.</small>{form[name].length>0&&<button type="button" onClick={()=>update(name,[])}>Clear dependencies</button>}</label>
  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.scrollBody}><fieldset disabled={busy} className={styles.grid}>
      <div className={styles.contentColumn}>
        {input('title','Task title','text',{required:true,maxLength:240,autoFocus:true})}
        <div className={styles.group}><h3>Description</h3><TaskDescription disabled={busy} initialHtml={editingTask?.descriptionHtml} initialText={editingTask?.description} onChange={(description,descriptionHtml)=>setForm(current=>({...current,description,descriptionHtml}))}/></div>
        <section className={styles.subtasks}><div className={styles.sectionHeading}><h3>Subtasks</h3><button type="button" onClick={()=>update('subtasks',[...form.subtasks,{key:crypto.randomUUID(),title:'',completed:false}])}>+ Add subtask</button></div>
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
        {input('labels','Labels','text',{placeholder:'frontend, launch, customer'})}
        {input('estimate','Estimate (hours)','number',{min:.5,max:1000,step:.5,required:true})}
        <h3>Schedule</h3>{input('startDate','Start date','date')}{input('endDate','End date','date',{min:form.startDate || undefined})}
        <label className={styles.milestone}><span>Milestone<small>A key checkpoint in your schedule</small></span><input type="checkbox" role="switch" name="milestone" checked={form.milestone} onChange={change}/></label>
        <h3>Dependencies</h3>{dependency('blockedBy','Blocked by')}{dependency('blocking','Blocking')}
      </aside>
    </fieldset></div>
    <footer className={styles.actions}>{error&&<p role="alert">{error}</p>}<span>{editingTask?'Changes are saved to this task.':'Create a task for your team.'}</span><div><button type="button" onClick={onCancel} disabled={busy}>Cancel</button><button type="submit" className={styles.save} disabled={busy}>{busy?'Saving…':'Save Task'}</button></div></footer>
  </form>
}
