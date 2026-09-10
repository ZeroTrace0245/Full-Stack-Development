import fs from 'node:fs'
if (fs.readFileSync('src/components/Board.jsx', 'utf8').includes('board-sort-')) {
  throw new Error('Quality-of-life changes are already applied. Edit the source files directly.')
}
function edit(path, transform) { const source = fs.readFileSync(path, 'utf8'); fs.writeFileSync(path, transform(source)) }
edit('src/components/Board.jsx', s => s.replace("useMemo, useState", "useEffect, useMemo, useRef, useState")
 .replace("const isDone", "import { usePreference, readPreference, writePreference } from '../utils/preferences'\nconst isDone")
 .replace("[query,setQuery]=useState('')", "[query,setQuery]=usePreference(`board-query-${user?.id}`, '')")
 .replace("[priority,setPriority]=useState('All')", "[priority,setPriority]=usePreference(`board-priority-${user?.id}`, 'All')")
 .replace("[assignee,setAssignee]=useState('All')", "[assignee,setAssignee]=usePreference(`board-assignee-${user?.id}`, 'All')")
 .replace("[collapsed,setCollapsed]=useState([])", "[collapsed,setCollapsed]=usePreference(`board-collapsed-${user?.id}`, [])")
 .replace(" const sensors=", ` const searchRef = useRef(null), boardRef = useRef(null)
 const [sort, setSort] = usePreference(\`board-sort-\${user?.id}\`, 'manual')
 useEffect(() => {
   const key = \`board-scroll-\${user?.id}\`
   const root = boardRef.current
   const saved = readPreference(key, {})
   const frame = requestAnimationFrame(() => {
     window.scrollTo(0, saved.window || 0)
     root?.querySelectorAll('[data-scroll-key]').forEach(el => { el.scrollTop = saved[el.dataset.scrollKey] || 0 })
   })
   const remember = () => {
     const positions = { window: window.scrollY }
     root?.querySelectorAll('[data-scroll-key]').forEach(el => { positions[el.dataset.scrollKey] = el.scrollTop })
     writePreference(key, positions)
   }
   const shortcut = event => {
     if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !document.querySelector('dialog[open]') && !event.target.closest('input,textarea,select,[contenteditable="true"]')) {
       event.preventDefault(); searchRef.current?.focus()
     }
   }
   window.addEventListener('scroll', remember, true)
   document.addEventListener('keydown', shortcut)
   return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', remember, true); document.removeEventListener('keydown', shortcut) }
 }, [user?.id])
 const sensors=`)
 .replace("query.toLowerCase()", "query.trim().toLowerCase()")
 .replace("${task.title} ${task.description}", "${task.title} ${task.description} ${task.assignee || ''} ${task.id}")
 .replace("assignee===assignee", "assignee===assignee")
 .replace("task.assignee===assignee))}))", "task.assignee===assignee)).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):sort==='priority'?({High:0,Medium:1,Low:2}[a.priority]??3)-({High:0,Medium:1,Low:2}[b.priority]??3):sort==='due'?(a.dueDate||'9999').localeCompare(b.dueDate||'9999'):0)}))")
 .replace("<div className={styles.board}>", "<div ref={boardRef} className={styles.board}>")
 .replace('<input aria-label="Search tasks and labels"', '<input ref={searchRef} type="search" aria-keyshortcuts="/" aria-label="Search tasks and labels"')
 .replace('placeholder="Search tasks, labels…" /></label>', 'placeholder="Search tasks, people, labels… (/)" />{query&&<button type="button" aria-label="Clear search" onClick={()=>{setQuery(\'\');searchRef.current?.focus()}}>×</button>}</label>')
 .replace('<button onClick={()=>{setQuery', '<select aria-label="Sort tasks" value={sort} onChange={e=>setSort(e.target.value)}><option value="manual">Board order</option><option value="title">Title</option><option value="priority">Priority</option><option value="due">Due date</option></select><button onClick={()=>{setQuery')
 .replace('  {focusOpen&&', '  <p role="status">{visibleColumns.reduce((sum,column)=>sum+column.tasks.length,0)} of {allTasks.length} tasks shown{visibleColumns.every(column=>!column.tasks.length)&&allTasks.length>0?\' — No matches. Try another search or clear the filters.\':\'\'}</p>\n  {focusOpen&&'))
edit('src/components/Column.jsx', s => s.replace('className={styles.tasks} ref={setNodeRef}', 'className={styles.tasks} data-scroll-key={column.id} ref={setNodeRef}'))
edit('src/components/TaskForm.jsx', s => s.replace('useEffect, useState', 'useEffect, useRef, useState')
 .replace("import apiClient", "import { readPreference, writePreference } from '../utils/preferences'\nimport apiClient")
 .replace('editingTask })', 'editingTask, onBusyChange })')
 .replace("  const [members", "  const pending = useRef(false)\n  const defaults = readPreference(`task-defaults-${user?.id}`, {})\n  const [fieldErrors, setFieldErrors] = useState({})\n  const [members")
 .replace("editingTask?.assignee || ''", "editingTask ? (editingTask.assignee || '') : (defaults.assignee || '')")
 .replace("editingTask?.priority || 'Medium'", "editingTask?.priority || defaults.priority || 'Medium'")
 .replace("editingTask?.type || 'Feature'", "editingTask?.type || defaults.type || 'Feature'")
 .replace('event.preventDefault(); if (busy) return', `event.preventDefault(); if (pending.current) return
    const errors = {}
    if (!form.title.trim()) errors.title = 'Enter a task title.'
    if (!Number.isFinite(Number(form.estimate)) || Number(form.estimate)<0.5 || Number(form.estimate)>1000) errors.estimate = 'Enter an estimate between 0.5 and 1000 hours.'
    if (form.startDate && form.endDate && form.startDate>form.endDate) errors.endDate = 'End date must be on or after start date.'
    if (form.subtasks.some(item=>!item.title.trim())) errors.subtasks = 'Give each subtask a title or remove it.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) { event.currentTarget.elements.namedItem(Object.keys(errors)[0])?.focus(); return }`)
 .replace("setBusy(true);setError('')", "pending.current=true;setBusy(true);onBusyChange?.(true);setError('')")
 .replace("      })\n    } catch", "      })\n      writePreference(`task-defaults-${user?.id}`, { assignee:form.assignee, priority:form.priority, type:form.type })\n    } catch")
 .replace('finally { setBusy(false) }', 'finally { pending.current=false;setBusy(false);onBusyChange?.(false) }')
 .replace('onChange={change} {...extra}/></label>', 'onChange={change} aria-invalid={Boolean(fieldErrors[name])} aria-describedby={fieldErrors[name]?`error-${name}`:undefined} {...extra}/>{fieldErrors[name]&&<small id={`error-${name}`} role="alert">{fieldErrors[name]}</small>}</label>')
 .replace('<form className={styles.form} onSubmit={submit}>', '<form className={styles.form} onSubmit={submit} aria-busy={busy} onKeyDown={event=>{if((event.ctrlKey||event.metaKey)&&event.key===\'Enter\'){event.preventDefault();event.currentTarget.requestSubmit()}}}>')
 .replace('<section className={styles.subtasks}>', '<section className={styles.subtasks}>{fieldErrors.subtasks&&<p role="alert">{fieldErrors.subtasks}</p>}')
 .replace("{input('labels','Labels','text',{placeholder:'frontend, launch, customer'})}", "{input('labels','Labels','text',{placeholder:'frontend, launch, customer',list:'recent-labels'})}<datalist id=\"recent-labels\">{[...new Set(tasks.flatMap(task=>task.labels||[]))].map(label=><option key={label} value={label}/>)}</datalist>"))
edit('src/App.jsx', s => s.replace("import React, { useState }", "import React, { useRef, useState }")
 .replace("  const [showActivity", "  const taskBusy = useRef(false)\n  const [showActivity")
 .replace('    setDeleteConfirm({ taskId, taskTitle })', '    handleDeleteTask(taskId, taskTitle)')
 .replace('        onClose={() => {\n          setIsModalOpen', '        onClose={() => {\n          if (taskBusy.current) return\n          setIsModalOpen')
 .replace('          columns={board.columns}', '          onBusyChange={busy=>{taskBusy.current=busy}}\n          columns={board.columns}'))
// Undo keeps the original record intact until the grace period expires.
edit('src/context/BoardContext.jsx', s => s.replace('useEffect, useState', 'useEffect, useRef, useState')
 .replace("  const [error", "  const pendingDeletes = useRef(new Map())\n  const [deletions, setDeletions] = useState([])\n  const [notice, setNotice] = useState('')\n  const [error")
 .replace('  useEffect(() => {\n    if (!user)', '  useEffect(() => () => { pendingDeletes.current.forEach(item=>clearTimeout(item.timer)); pendingDeletes.current.clear() }, [user?.id])\n\n  useEffect(() => {\n    setDeletions([]); setNotice(\'\'); setError(\'\')\n    if (!user)')
 .replace('    return task', "    setNotice('Task saved.'); setError('')\n    return task")
 .replace('    return task', '    return task')
 .replace(/  const handleDeleteTask = async[\s\S]*?\n  const handleMoveTask/, `  const handleDeleteTask = (taskId, taskTitle) => {
    if (pendingDeletes.current.has(taskId)) return
    const item = { taskId, taskTitle }
    item.timer = setTimeout(async () => {
      pendingDeletes.current.delete(taskId)
      try {
        await apiClient.deleteTask(taskId)
        setBoard(current => ({ ...current, columns: current.columns.map(column => ({ ...column, tasks: column.tasks.filter(task => task.id !== taskId) })) }))
        addActivity(\`Task "\${taskTitle}" was deleted\`)
        setNotice('Task deleted.')
      } catch (err) { setError(err.error || err.message || 'Could not delete task. It has been restored.') }
      finally { setDeletions(current=>current.filter(entry=>entry.taskId!==taskId)) }
    }, 10000)
    pendingDeletes.current.set(taskId, item)
    setDeletions(current=>[...current,item])
  }
  const undoDelete = taskId => {
    const item = pendingDeletes.current.get(taskId)
    if (!item) return
    clearTimeout(item.timer); pendingDeletes.current.delete(taskId)
    setDeletions(current=>current.filter(entry=>entry.taskId!==taskId))
    setNotice('Deletion undone.')
  }

  const handleMoveTask`)
 .replace('value={{ board,', 'value={{ board: { ...board, columns: board.columns.map(column=>({...column,tasks:column.tasks.filter(task=>!deletions.some(item=>item.taskId===task.id))})) },')
 .replace(' }}>{children}</BoardContext.Provider>', ` }}>{children}{user && <aside className="task-feedback" aria-label="Task updates">
      {error && <p role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss error">×</button></p>}
      {notice && <p role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss update">×</button></p>}
      {deletions.map(item=><p key={item.taskId} role="status">Deleting “{item.taskTitle}”<button disabled={!pendingDeletes.current.has(item.taskId)} onClick={()=>undoDelete(item.taskId)}>Undo</button></p>)}
    </aside>}</BoardContext.Provider>`))
edit('src/components/TaskCard.jsx', s => s.replace("import React from 'react'", "import React, { useRef, useState } from 'react'\nimport { useBoard } from '../context/BoardContext'")
 .replace('  const { user }', `  const { board, handleEditTask } = useBoard()
  const [busy, setBusy] = useState(false), [feedback, setFeedback] = useState('')
  const pending = useRef(false)
  const doneColumn = board.columns.find(item=>/done|complete|deployed|production/i.test(item.title))
  const quickAction = async action => {
    if (pending.current) return
    pending.current=true; setBusy(true); setFeedback('')
    try { await action() } catch (err) { setFeedback(err.error || err.message || 'Action failed. Please try again.') }
    finally { pending.current=false; setBusy(false) }
  }
  const { user }`)
 .replace('<div className={styles.secondary}>', `<div className={styles.secondary}>
          {doneColumn && task.columnId!==doneColumn.id && <button type="button" disabled={busy} className={styles.actionBtn} title="Mark complete" aria-label={\`Complete \${task.title}\`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();quickAction(()=>handleEditTask({id:task.id,columnId:doneColumn.id}))}}>✓</button>}
          <button type="button" disabled={busy} className={styles.actionBtn} title="Copy task details" aria-label={\`Copy \${task.title}\`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();quickAction(async()=>{await navigator.clipboard.writeText([task.title,task.description,\`Priority: \${task.priority}\`,\`Assignee: \${task.assignee||'Unassigned'}\`].filter(Boolean).join('\\n'));setFeedback('Copied.')})}}>⧉</button>`)
 .replace('title="Edit task"', 'disabled={busy} title="Edit task"')
 .replace('title="Delete task"', 'disabled={busy} title="Delete task"')
 .replace('      {/* Compact', '      {feedback&&<p role="status">{feedback}</p>}\n      {/* Compact'))
fs.appendFileSync('src/index.css', '\n.task-feedback{position:fixed;bottom:20px;right:20px;z-index:1000;display:grid;gap:8px;max-width:min(420px,calc(100vw - 40px));max-height:40vh;overflow:auto}.task-feedback:empty{display:none}.task-feedback p{margin:0;padding:14px 18px;background:#172439;color:#f1f5fc;border:1px solid #7997bd;border-radius:12px;box-shadow:0 6px 24px #0004;display:flex;align-items:center;gap:14px;overflow-wrap:anywhere}.task-feedback button{color:inherit;background:transparent;border:1px solid #7997bd;border-radius:6px;padding:6px 10px;cursor:pointer}.task-feedback button:focus-visible{outline:2px solid #a5c9ff;outline-offset:3px}\n')
