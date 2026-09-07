import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePlanning } from './taskPlanning.js'
import Task from '../models/Task.js'

test('schedule validates dates and keeps legacy dueDate compatible', () => {
  assert.equal(normalizePlanning({ startDate: '2026-09-01', endDate: '2026-09-10' }).dueDate, '2026-09-10')
  assert.equal(normalizePlanning({ dueDate: '2026-09-12' }).endDate, '2026-09-12')
  assert.equal(normalizePlanning({ endDate: '' }, { endDate: '2026-09-10' }).dueDate, '')
  assert.throws(() => normalizePlanning({ startDate: '2026-09-12' }, { endDate: '2026-09-10' }), /End date/)
  assert.throws(() => normalizePlanning({ endDate: '2026-02-30' }), /calendar date/)
})

test('progress is derived from subtask completion, including removal of all subtasks', () => {
  assert.equal(normalizePlanning({ progress: 90, subtasks: [{ title: 'Design', completed: true }, { title: 'Build', completed: false }, { title: 'Review', completed: false }] }).progress, 33)
  assert.equal(normalizePlanning({ subtasks: [] }, { progress: 100 }).progress, 0)
  assert.throws(() => normalizePlanning({ subtasks: [{ title: ' ', completed: false }] }), /subtask/)
})

test('dependencies reject self references and conflicting directions', () => {
  assert.throws(() => normalizePlanning({ blockedBy: ['a'] }, { id: 'a' }), /other tasks/)
  assert.throws(() => normalizePlanning({ blockedBy: ['b'], blocking: ['b'] }), /both block/)
  assert.deepEqual(normalizePlanning({ blockedBy: ['b', 'b'] }).blockedBy, ['b'])
})

test('Mongo task model retains planning fields, formatted description, comments, and completion', async () => {
  const task = new Task({ title: 'Milestone review', columnId: 'col-1', createdBy: '507f1f77bcf86cd799439011',
    ...normalizePlanning({ startDate: '2026-09-01', endDate: '2026-09-10', milestone: true, blockedBy: ['task-a'], blocking: ['task-b'], descriptionHtml: '<strong>Review</strong>', subtasks: [{ title: 'QA', completed: true }], comments: ['Reviewer: ready'] }) })
  await task.validate()
  const saved = task.toJSON()
  assert.equal(saved.milestone, true)
  assert.equal(saved.progress, 100)
  assert.equal(saved.endDate, saved.dueDate)
  assert.deepEqual(saved.blockedBy, ['task-a'])
  assert.equal(saved.descriptionHtml, '<strong>Review</strong>')
  assert.deepEqual(saved.comments, ['Reviewer: ready'])
})
