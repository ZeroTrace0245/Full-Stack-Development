import test from 'node:test'
import assert from 'node:assert/strict'
import { canDeleteMessage } from './messagePermissions.js'

test('senders can delete their own team and direct messages', () => {
  for (const kind of ['team','direct']) assert.equal(canDeleteMessage({ kind, sender:'member' }, { userId:'member' }),true)
})
test('members cannot delete messages sent by someone else', () => {
  for (const kind of ['team','direct']) assert.equal(canDeleteMessage({ kind, sender:'other', receiver:'member' }, { userId:'member' }),false)
})
test('administrator moderation applies to team posts only', () => {
  assert.equal(canDeleteMessage({ kind:'team', sender:'other' }, { userId:'admin', role:'Admin' }),true)
  assert.equal(canDeleteMessage({ kind:'direct', sender:'other', receiver:'admin' }, { userId:'admin', role:'Admin' }),false)
})
test('populated sender IDs preserve ownership checks', () => {
  assert.equal(canDeleteMessage({ kind:'direct', sender:{ _id:'member' } }, { userId:'member' }),true)
  assert.equal(canDeleteMessage({ kind:'direct', sender:{ id:'other' } }, { userId:'member' }),false)
})
