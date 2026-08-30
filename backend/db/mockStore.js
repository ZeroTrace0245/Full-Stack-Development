import bcryptjs from 'bcryptjs'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const storePath = resolve(dirname(fileURLToPath(import.meta.url)), '../data/local-store.json')
const initialStore = () => ({ users: [{ id: 'admin-001', username: 'admin', email: 'admin@novasync.local', role: 'Admin', passwordHash: bcryptjs.hashSync('Admin@123', 10), createdAt: new Date().toISOString() }], tasks: [], messages: [] })

function loadStore() {
  if (!existsSync(storePath)) return initialStore()
  try { const parsed = JSON.parse(readFileSync(storePath, 'utf8')); return { users: parsed.users || [], tasks: parsed.tasks || [], messages: parsed.messages || [] } }
  catch (error) { throw new Error(`Local data file is invalid: ${error.message}`) }
}

export const mockStore = loadStore()
export const mockId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export function persistStore() { mkdirSync(dirname(storePath), { recursive: true }); const temporaryPath = `${storePath}.tmp`; writeFileSync(temporaryPath, JSON.stringify(mockStore, null, 2), 'utf8'); renameSync(temporaryPath, storePath) }
export function initializeStore() { if (!existsSync(storePath)) persistStore(); return storePath }
