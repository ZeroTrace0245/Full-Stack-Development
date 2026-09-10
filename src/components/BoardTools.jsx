import { useRef, useState } from 'react'
import { useBoard } from '../context/BoardContext'
import { useAuth } from '../context/AuthContext'
import { canEditTask, downloadFile, parseBackup, taskInput, tasksCsv } from '../utils/taskTools'

export default function BoardTools({ visibleTasks }) {
  const { board, archivedTasks, handleEditTask, handleCreateTask, handleDeleteTask } = useBoard()
  const { user } = useAuth()
  const [selected, setSelected] = useState([]), [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const [archiveQuery, setArchiveQuery] = useState(''), [backup, setBackup] = useState(null)
  const pending = useRef(false)
  const eligible = visibleTasks.filter(task => canEditTask(task, user))
  const chosen = eligible.filter(task => selected.includes(task.id))
  const all = [...board.columns.flatMap(column => column.tasks), ...archivedTasks]
  const run = async (tasks, action) => {
    if (pending.current) return
    pending.current = true; setBusy(true); setMessage('')
    let succeeded = 0; const failed = []
    for (const task of tasks) {
      try { await action(task); succeeded++ } catch (error) { failed.push(`${task.title}: ${error.error || error.message || 'Action failed'}`) }
    }
    setSelected([]); setMessage(`${succeeded} task(s) processed.${failed.length ? ` ${failed.length} failed: ${failed.join('; ')}` : ''}`)
    pending.current = false; setBusy(false)
  }
  const importBackup = async () => {
    if (pending.current || !backup) return
    pending.current = true; setBusy(true); setMessage('')
    const created = new Map()
    try {
      for (const task of backup) {
        const result = await handleCreateTask({ ...taskInput(task), blockedBy: [], blocking: [], relationship: '', relatedTaskId: '' })
        created.set(task.id, result.id)
      }
      for (const task of backup) {
        if (task.blockedBy?.length || task.blocking?.length || task.relatedTaskId) await handleEditTask({ id: created.get(task.id), blockedBy: (task.blockedBy || []).map(id => created.get(id)), blocking: (task.blocking || []).map(id => created.get(id)), relationship: task.relationship || '', relatedTaskId: created.get(task.relatedTaskId) || '' })
      }
      setMessage(`Imported ${created.size} tasks as new records.`)
    } catch (error) { setMessage(`Import stopped after creating ${created.size} tasks. Some relationships may be incomplete. ${error.error || error.message || 'Request failed'}. Review these tasks before retrying.`) }
    finally { setBackup(null); pending.current = false; setBusy(false) }
  }
  return <details className="board-tools"><summary>Manage tasks & backups</summary>
    <fieldset disabled={busy}><legend>Bulk actions</legend>
      <button type="button" onClick={() => setSelected(eligible.map(task => task.id))}>Select visible tasks</button>
      <button type="button" onClick={() => setSelected([])}>Clear selection</button>
      <span>{chosen.length} selected</span>
      <div className="task-selection">{eligible.map(task => <label key={task.id}><input type="checkbox" checked={selected.includes(task.id)} onChange={event => setSelected(current => event.target.checked ? [...current, task.id] : current.filter(id => id !== task.id))}/>{task.title}</label>)}</div>
      <select aria-label="Set selected tasks priority" value="" disabled={!chosen.length} onChange={event => { const priority = event.target.value; run(chosen, task => handleEditTask({ id: task.id, priority })) }}><option value="" disabled>Set priority…</option>{['Low','Medium','High'].map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Move selected tasks" value="" disabled={!chosen.length} onChange={event => { const columnId = event.target.value; run(chosen, task => handleEditTask({ id: task.id, columnId })) }}><option value="" disabled>Move to…</option>{board.columns.map(column => <option key={column.id} value={column.id}>{column.title}</option>)}</select>
      <button disabled={!chosen.length} onClick={() => run(chosen, task => handleDeleteTask(task.id, task.title))}>Delete selected (Undo available)</button>
      <button onClick={() => run(all.filter(task => !task.archived && canEditTask(task, user) && board.columns.some(column => column.id === task.columnId && /done|complete|deployed|production/i.test(column.title))), task => handleEditTask({ id: task.id, archived: true }))}>Archive completed tasks</button>
    </fieldset>
    <details><summary>Archived tasks ({archivedTasks.length})</summary><input type="search" aria-label="Search archived tasks" placeholder="Search archived tasks" value={archiveQuery} onChange={event => setArchiveQuery(event.target.value)}/><div className="task-selection">{archivedTasks.filter(task => `${task.title} ${task.description || ''} ${(task.labels || []).join(' ')}`.toLowerCase().includes(archiveQuery.toLowerCase())).map(task => <div key={task.id}><span>{task.title}</span><button disabled={busy || !canEditTask(task, user)} onClick={() => run([task], item => handleEditTask({ id: item.id, archived: false }))}>Restore</button></div>)}</div></details>
    <fieldset disabled={busy}><legend>Local backups</legend>
      <button onClick={() => downloadFile('novasync-backup.json', JSON.stringify({ version: 1, tasks: all }, null, 2), 'application/json')}>Export JSON</button>
      <button onClick={() => downloadFile('novasync-tasks.csv', tasksCsv(all), 'text/csv;charset=utf-8')}>Export CSV</button>
      <label>Import JSON<input type="file" accept=".json,application/json" onChange={async event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { if (file.size > 5_000_000) throw new Error('Backup must be under 5 MB.'); setBackup(parseBackup(await file.text(), board.columns)); setMessage('') } catch (error) { setBackup(null); setMessage(error.message) } }}/></label>
      {backup && <div><p>Import {backup.length} tasks as new records? Existing tasks remain. Assignment locks and account ownership are not imported.</p><button onClick={importBackup}>Import {backup.length} tasks</button><button onClick={() => setBackup(null)}>Cancel import</button></div>}
    </fieldset>
    {(busy || message) && <p role="status">{busy ? 'Processing tasks…' : message}</p>}
  </details>
}
