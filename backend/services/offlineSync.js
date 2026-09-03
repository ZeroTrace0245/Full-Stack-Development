import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import OfflineSnapshot from '../models/OfflineSnapshot.js'
import { mockStore, onStorePersist, replaceStore } from '../db/mockStore.js'

const statePath = resolve(dirname(fileURLToPath(import.meta.url)), '../data/sync-state.json')
const snapshotKey = 'novasync-primary'
let timer
let syncing = false

function loadState() {
  try { return JSON.parse(readFileSync(statePath, 'utf8')) }
  catch { return { sourceId: randomUUID(), lastRevision: 0, dirty: true } }
}

const state = loadState()
function saveState() { writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8') }
function snapshotData() { return structuredClone({ users: mockStore.users, tasks: mockStore.tasks, messages: mockStore.messages }) }

const collectionNames = ['users', 'tasks', 'messages']

function syncId(item) {
  return String(item?.id || item?._id || randomUUID())
}

async function mirrorCollections(data) {
  const database = mongoose.connection.db
  for (const name of collectionNames) {
    const collection = database.collection(name)
    const items = Array.isArray(data[name]) ? data[name] : []
    const ids = items.map(syncId)

    if (items.length) {
      await collection.bulkWrite(items.map(item => {
        const id = syncId(item)
        const document = structuredClone(item)
        delete document._id
        return {
          replaceOne: {
            filter: { _syncId: id },
            replacement: { ...document, id, _syncId: id, _syncedAt: new Date() },
            upsert: true
          }
        }
      }))
    }

    await collection.deleteMany({
      _syncId: ids.length ? { $nin: ids } : { $exists: true }
    })
  }
}

export function markLocalChanges() {
  state.dirty = true
  saveState()
  scheduleSync(250)
}

export function scheduleSync(delay = 0) {
  clearTimeout(timer)
  timer = setTimeout(syncNow, delay)
}

export async function syncNow() {
  if (syncing || mongoose.connection.readyState !== 1) return false
  syncing = true
  try {
    const remote = await OfflineSnapshot.findOne({ key: snapshotKey }).lean()
    if (!remote) {
      const created = await OfflineSnapshot.create({ key: snapshotKey, revision: 1, sourceId: state.sourceId, data: snapshotData() })
      state.lastRevision = created.revision
      state.dirty = false
    } else if (state.dirty) {
      const updated = await OfflineSnapshot.findOneAndUpdate(
        { key: snapshotKey },
        { $set: { data: snapshotData(), sourceId: state.sourceId }, $inc: { revision: 1 } },
        { new: true }
      ).lean()
      state.lastRevision = updated.revision
      state.dirty = false
    } else if (remote.revision > state.lastRevision) {
      replaceStore(remote.data)
      state.lastRevision = remote.revision
    }
    await mirrorCollections(snapshotData())
    saveState()
    return true
  } catch (error) {
    console.warn(`⚠️ Atlas sync deferred: ${error.message}`)
    return false
  } finally { syncing = false }
}

export function startOfflineSync() {
  if (!existsSync(statePath)) saveState()
  onStorePersist(markLocalChanges)
  scheduleSync()
  return setInterval(syncNow, Number(process.env.SYNC_INTERVAL_MS) || 15000)
}

export function stopOfflineSync() { clearTimeout(timer) }
