export function normalizePlanning(input, existing = {}) {
  const result = { ...input }
  if ('dueDate' in input && !('endDate' in input)) result.endDate = input.dueDate
  const merged = { ...existing, ...result }
  for (const key of ['startDate', 'endDate']) {
    const value = merged[key]
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw new Error(`${key} must be a valid calendar date`)
  }
  const end = merged.endDate || merged.dueDate
  if (merged.startDate && end && merged.startDate > end) throw new Error('End date must be on or after start date')
  if ('endDate' in result) result.dueDate = result.endDate
  for (const key of ['blockedBy', 'blocking']) {
    if (key in input) {
      if (!Array.isArray(input[key]) || input[key].some(id => typeof id !== 'string' || !id.trim() || id === String(existing.id || existing._id || ''))) throw new Error('Dependencies must reference other tasks')
      result[key] = [...new Set(input[key])]
    }
  }
  if ((result.blockedBy || merged.blockedBy || []).some(id => (result.blocking || merged.blocking || []).includes(id))) throw new Error('A task cannot both block and be blocked by the same task')
  if ('milestone' in input && typeof input.milestone !== 'boolean') throw new Error('Milestone must be a boolean')
  if ('subtasks' in input) {
    if (!Array.isArray(input.subtasks) || input.subtasks.some(item => !item || typeof item.title !== 'string' || !item.title.trim() || typeof item.completed !== 'boolean')) throw new Error('Each subtask needs a title and completion state')
    result.progress = input.subtasks.length ? Math.round(input.subtasks.filter(item => item.completed).length / input.subtasks.length * 100) : 0
  }
  return result
}
