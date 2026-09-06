import test from 'node:test'
import assert from 'node:assert/strict'
import { dashboardTasks, taskDate } from './dashboardData.js'

test('schedule excludes completed and invalid dates and distinguishes today from overdue', () => {
  const result = dashboardTasks([
    { title: 'In progress — awaiting stakeholder review', tasks: [
      { id: 'later', title: 'Review the complete multi-team onboarding and accessibility specification', dueDate: '2026-09-10' },
      { id: 'today', title: 'QA', dueDate: '2026-09-06' },
      { id: 'late', dueDate: '2026-09-05' },
      { id: 'invalid', dueDate: 'invalid' },
      { id: 'undated' },
    ] },
    { title: 'Done', tasks: [{ id: 'finished', dueDate: '2026-09-01' }] },
  ], new Date(2026, 8, 6, 15))
  assert.deepEqual(result.scheduled.map(task => task.id), ['late', 'today', 'later'])
  assert.deepEqual(result.scheduled.map(task => task.overdue), [true, false, false])
  assert.equal(result.unscheduled, 2)
  assert.equal(result.scheduled[2].columnTitle, 'In progress — awaiting stakeholder review')
  assert.equal(taskDate('2026-09-06').getDate(), 6)
})

test('empty boards have no fabricated schedule or recent activity', () => {
  assert.deepEqual(dashboardTasks([]), { recent: [], scheduled: [], unscheduled: 0 })
})

test('timeline is capped at six and recent tasks use actual activity timestamps', () => {
  const tasks = Array.from({ length: 8 }, (_, index) => ({
    id: index, dueDate: `2026-09-${String(index + 10).padStart(2, '0')}`,
    createdAt: `2026-08-${String(index + 10).padStart(2, '0')}T12:00:00Z`,
  }))
  tasks[0].updatedAt = '2026-09-05T12:00:00Z'
  const result = dashboardTasks([{ title: 'To do', tasks }])
  assert.equal(result.scheduled.length, 6)
  assert.equal(result.unscheduled, 0)
  assert.deepEqual(result.recent.map(task => task.id), [0, 7, 6, 5])
})
