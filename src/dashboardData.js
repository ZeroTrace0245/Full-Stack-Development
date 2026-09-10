export const isDone = title => /done|complete|deployed|production/i.test(title)
export const isDoing = title => /doing|progress|development/i.test(title)

// Interpret date-only deadlines in local time, without a UTC day shift.
export function taskDate(value) {
  if (!value) return null
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function dashboardTasks(columns, now = new Date()) {
  const all = columns.flatMap(column => column.tasks.map(task => ({ ...task, columnTitle: column.title })))
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const open = all.filter(task => !isDone(task.columnTitle))
  const scheduled = open.map(task => ({ ...task, deadline: taskDate(task.endDate || task.dueDate) }))
    .filter(task => task.deadline)
    .sort((a, b) => a.deadline - b.deadline)
    .map(task => ({ ...task, overdue: task.deadline < startOfDay }))
  const recent = [...all].sort((a, b) =>
    (taskDate(b.updatedAt || b.createdAt)?.getTime() || 0) -
    (taskDate(a.updatedAt || a.createdAt)?.getTime() || 0)).slice(0, 4)
  return { recent, scheduled: scheduled.slice(0, 6), unscheduled: open.length - scheduled.length }
}
