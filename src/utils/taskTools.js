export const canEditTask = (task, user) => !task.assignmentLocked || user?.role === 'Admin' || String(task.assignedUserId) === String(user?.id)
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
export function matchesQuickFilter(task, filter, user, done, today = localDate()) {
  if (filter === 'mine') return task.assignee === user?.username || Boolean(task.assignedUserId && String(task.assignedUserId) === String(user?.id))
  if (filter === 'overdue') return !done && Boolean(task.dueDate && task.dueDate < today)
  if (filter === 'today') return !done && task.dueDate === today
  return true
}
const fields = ['title','description','descriptionHtml','columnId','assignee','priority','type','estimate','labels','startDate','endDate','dueDate','milestone','subtasks','comments','blockedBy','blocking','relationship','relatedTaskId','archived']
export function taskInput(task) { return Object.fromEntries(fields.filter(key => key in task).map(key => [key, task[key]])) }
export function duplicateTask(task, columnId) {
  return { ...taskInput(task), title: `${task.title.slice(0,230)} (copy)`, columnId, archived: false, comments: [], blockedBy: [], blocking: [], relationship: '', relatedTaskId: '', subtasks: (task.subtasks || []).map(item => ({ title: item.title, completed: false })) }
}
export function parseBackup(text, columns) {
  const data = JSON.parse(text)
  if (data.version !== 1 || !Array.isArray(data.tasks) || !data.tasks.length || data.tasks.length > 1000) throw new Error('Choose a NovaSync JSON backup containing 1–1000 tasks.')
  const ids = new Set()
  for (const task of data.tasks) {
    if (!task || typeof task.id !== 'string' || ids.has(task.id)) throw new Error('Backup task IDs must be unique strings.')
    ids.add(task.id)
    if (typeof task.title !== 'string' || !task.title.trim() || task.title.length > 240 || !columns.some(column => column.id === task.columnId)) throw new Error('A task has an invalid title or column.')
    if (!['Low','Medium','High'].includes(task.priority) || !['Feature','Bug','UI'].includes(task.type) || !Number.isFinite(task.estimate) || task.estimate < 0 || task.estimate > 1000) throw new Error('A task has invalid priority, type, or estimate.')
    for (const key of ['description','descriptionHtml','assignee','relationship','relatedTaskId']) if (key in task && typeof task[key] !== 'string') throw new Error(`Invalid ${key}.`)
    for (const key of ['labels','comments','blockedBy','blocking']) if (key in task && (!Array.isArray(task[key]) || task[key].some(value => typeof value !== 'string'))) throw new Error(`Invalid ${key}.`)
    if (task.labels?.length > 5) throw new Error('Tasks may have up to five labels.')
    if ('archived' in task && typeof task.archived !== 'boolean') throw new Error('Invalid archive state.')
    if ('milestone' in task && typeof task.milestone !== 'boolean') throw new Error('Invalid milestone state.')
    if (task.relationship && !['blocks','depends-on','related-to','duplicate-of'].includes(task.relationship)) throw new Error('Invalid relationship.')
    if ('subtasks' in task && (!Array.isArray(task.subtasks) || task.subtasks.some(item => !item || typeof item.title !== 'string' || !item.title.trim() || typeof item.completed !== 'boolean'))) throw new Error('Invalid subtasks.')
    for (const key of ['startDate','endDate','dueDate']) if (task[key] && (typeof task[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(task[key]) || Number.isNaN(Date.parse(task[key])) || new Date(task[key]).toISOString().slice(0,10) !== task[key])) throw new Error('Invalid schedule date.')
    if (task.startDate && (task.endDate || task.dueDate) && task.startDate > (task.endDate || task.dueDate)) throw new Error('Invalid schedule range.')
  }
  for (const task of data.tasks) {
    for (const id of [...(task.blockedBy || []), ...(task.blocking || []), ...(task.relatedTaskId ? [task.relatedTaskId] : [])]) if (!ids.has(id) || id === task.id) throw new Error('Backup dependencies must refer to other tasks in the backup.')
    if (task.blockedBy?.some(id => task.blocking?.includes(id))) throw new Error('Conflicting dependencies in backup.')
  }
  return data.tasks
}
export function tasksCsv(tasks) {
  const keys = ['title','description','assignee','priority','type','columnId','dueDate','estimate','archived']
  const cell = value => { const text = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"','""')}"` }
  return [keys, ...tasks.map(task => keys.map(key => task[key]))].map(row => row.map(cell).join(',')).join('\r\n')
}
export function downloadFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
