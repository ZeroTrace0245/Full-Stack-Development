import test from 'node:test'
import assert from 'node:assert/strict'
import { canEditTask, duplicateTask, matchesQuickFilter, parseBackup, taskInput, tasksCsv } from './taskTools.js'
import { normalizePlanning } from '../../backend/utils/taskPlanning.js'

const columns = [{ id:'col-1' },{ id:'col-3' }]
const task = { id:'a', title:'Write report', columnId:'col-3', priority:'High', type:'Feature', estimate:2, labels:[], subtasks:[{ title:'Review', completed:true }], archived:true, blockedBy:[], blocking:[], comments:['Old comment'], assignedUserId:'owner', assignmentLocked:true }
const backup = tasks => JSON.stringify({ version:1, tasks })

test('duplicates reset completion, history, archive state, ownership and relationships', () => {
  const copy = duplicateTask(task,'col-1')
  assert.equal(copy.columnId,'col-1'); assert.equal(copy.title,'Write report (copy)')
  assert.equal(copy.archived,false); assert.deepEqual(copy.comments,[])
  assert.equal(copy.subtasks[0].completed,false)
  assert.equal(copy.assignedUserId,undefined); assert.equal(copy.assignmentLocked,undefined); assert.equal(copy.id,undefined)
  assert.equal(task.subtasks[0].completed,true)
})
test('quick filters use local calendar dates and exclude completed overdue tasks', () => {
  assert.equal(matchesQuickFilter({ dueDate:'2026-09-06' },'overdue',{},false,'2026-09-07'),true)
  assert.equal(matchesQuickFilter({ dueDate:'2026-09-06' },'overdue',{},true,'2026-09-07'),false)
  assert.equal(matchesQuickFilter({ dueDate:'2026-09-07' },'today',{},false,'2026-09-07'),true)
  assert.equal(matchesQuickFilter({},'today',{},false,'2026-09-07'),false)
  assert.equal(matchesQuickFilter({ assignedUserId:'owner' },'mine',{ id:'owner' },false),true)
})
test('locked tasks can only be changed by their assignee or an admin', () => {
  assert.equal(canEditTask(task,{ id:'other' }),false)
  assert.equal(canEditTask(task,{ id:'owner' }),true)
  assert.equal(canEditTask(task,{ role:'Admin' }),true)
})
test('backup validation accepts archive state and internal references', () => {
  const second = { ...task, id:'b', blockedBy:['a'] }
  assert.equal(parseBackup(backup([task,second]),columns).length,2)
  assert.equal(taskInput(task).assignmentLocked,undefined)
})
test('backup validation rejects invalid records before creating tasks', () => {
  for (const tasks of [[task,task], [{ ...task, title:'' }], [{ ...task, blockedBy:['missing'] }], [{ ...task, dueDate:'2026-02-30' }], [{ ...task, archived:'false' }], [{ ...task, subtasks:[{}] }]]) assert.throws(() => parseBackup(backup(tasks),columns))
  assert.throws(() => parseBackup('{',columns))
  assert.throws(() => parseBackup(JSON.stringify({ version:9,tasks:[task] }),columns))
})
test('CSV escapes quotes, line breaks and spreadsheet formulas', () => {
  const csv = tasksCsv([{ title:'=1+1', description:'a,"b"\nc' }])
  assert.ok(csv.includes('"\'=1+1"')); assert.ok(csv.includes('"a,""b""\nc"'))
})
test('archive state is validated by the backend without losing planning data', () => {
  assert.equal(normalizePlanning({ archived:true },task).archived,true)
  assert.equal(normalizePlanning({ archived:false },task).archived,false)
  assert.throws(() => normalizePlanning({ archived:'false' },task),/Archived/)
})
