import assert from 'node:assert/strict'
import router from '../backend/routes/auth.js'

async function validate(path, body) {
  const route = router.stack.find(layer => layer.route?.path === path && layer.route.methods.post).route
  const req = { body }
  for (const layer of route.stack) {
    if (!layer.handle.run) break
    await layer.handle.run(req)
  }
  let status = 200
  const res = { status(code) { status = code; return this }, json() {} }
  const validation = route.stack.find(layer => !layer.handle.run).handle
  validation(req, res, () => {})
  return status
}
for (const [password, expected] of [['short!', 400], ['abcdefgh', 400], ['abcdefg ', 400], ['abcdefg!', 200], ['Long password!', 200]]) {
  assert.equal(await validate('/register', { username: 'Test User', email: 'test@example.com', password }), expected)
}
assert.equal(await validate('/login', { identifier: 'existing-member', password: 'old123' }), 200)
console.log('Auth validation passed: short, missing-special and whitespace-only cases rejected; valid registration passwords accepted; existing sign-in password rules preserved. No accounts created.')
