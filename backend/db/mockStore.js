import bcryptjs from 'bcryptjs'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const storePath = resolve(dirname(fileURLToPath(import.meta.url)), '../data/local-store.json')
let persistListener = null
const demoMember = () => ({ id: 'member-demo-001', username: 'demo', email: 'demo@novasync.local', role: 'Standard User', passwordHash: bcryptjs.hashSync('Demo@123', 10), createdAt: new Date().toISOString() })
const initialStore = () => ({ users: [{ id: 'admin-001', username: 'admin', email: 'admin@novasync.local', role: 'Admin', passwordHash: bcryptjs.hashSync('Admin@123', 10), createdAt: new Date().toISOString() }, demoMember()], tasks: [], messages: [], notifications: [] })

function loadStore() {
  if (!existsSync(storePath)) return initialStore()
  try { const parsed = JSON.parse(readFileSync(storePath, 'utf8')); return { users: parsed.users || [], tasks: parsed.tasks || [], messages: parsed.messages || [], notifications: parsed.notifications || [] } }
  catch (error) { throw new Error(`Local data file is invalid: ${error.message}`) }
}

export const mockStore = loadStore()
export const mockId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export function persistStore({ notify = true } = {}) { mkdirSync(dirname(storePath), { recursive: true }); const temporaryPath = `${storePath}.tmp`; writeFileSync(temporaryPath, JSON.stringify(mockStore, null, 2), 'utf8'); renameSync(temporaryPath, storePath); if (notify) persistListener?.() }
export function replaceStore(data) { for (const key of ['users', 'tasks', 'messages', 'notifications']) mockStore[key] = Array.isArray(data?.[key]) ? data[key] : []; persistStore({ notify: false }) }
export function onStorePersist(listener) { persistListener = listener }
export function initializeStore() {
  if (!mockStore.users.some(user => user.id === 'member-demo-001' || user.username === 'demo')) {
    mockStore.users.push(demoMember())
    persistStore()
  } else if (!existsSync(storePath)) persistStore()
  return storePath
}
