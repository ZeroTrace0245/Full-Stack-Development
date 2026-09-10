import test from 'node:test'
import assert from 'node:assert/strict'
import { moveBoardTask } from './moveBoardTask.js'

const makeBoard = () => ({ columns: [
  { id: 'a', tasks: ['hidden', 'first', 'second'].map(id => ({ id, columnId: 'a' })) },
  { id: 'b', tasks: [{ id: 'target', columnId: 'b' }] }
] })

test('moving with a pending deletion selects the requested task and preserves the original board', () => {
  const board = makeBoard()
  const next = moveBoardTask(board, 'first', 'a', 'b', 0, ['hidden'])
  assert.deepEqual(next.columns[0].tasks.map(task => task.id), ['hidden', 'second'])
  assert.deepEqual(next.columns[1].tasks.map(task => task.id), ['first', 'target'])
  assert.equal(next.columns[1].tasks[0].columnId, 'b')
  assert.equal(board.columns[0].tasks[1].columnId, 'a')
  assert.equal(board.columns[0].tasks.length, 3)
})

test('manual reordering works in both directions with hidden tasks', () => {
  const board = makeBoard()
  const down = moveBoardTask(board, 'first', 'a', 'a', 1, ['hidden'])
  assert.deepEqual(down.columns[0].tasks.map(task => task.id), ['hidden', 'second', 'first'])
  const up = moveBoardTask(down, 'first', 'a', 'a', 0, ['hidden'])
  assert.deepEqual(up.columns[0].tasks.map(task => task.id), ['hidden', 'first', 'second'])
  assert.equal(moveBoardTask(board, 'missing', 'a', 'b', 0), board)
})
