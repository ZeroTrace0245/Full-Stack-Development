import { createHash, randomUUID } from 'node:crypto'
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
function snapshotData() { return structuredClone({ users: mockStore.users, tasks: mockStore.tasks, messages: mockStore.messages, notifications: mockStore.notifications }) }

const collectionNames = ['users', 'tasks', 'messages', 'notifications']

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
      await collection.bulkWrite(items.map((item, position) => {
        const id = syncId(item)
        const document = structuredClone(item)
        delete document._id
        return {
          replaceOne: {
            filter: { _syncId: id },
            replacement: { ...document, id, _syncId: id, _syncPosition: position, _syncedAt: new Date() },
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

function cleanRemoteDocument(document) {
  const plain = JSON.parse(JSON.stringify(document))
  plain.id = String(plain.id || plain._syncId || plain._id)
  delete plain._id
  delete plain._syncId
  delete plain._syncPosition
  delete plain._syncedAt
  return plain
}

function dataHash(data) {
  const canonical = Object.fromEntries(collectionNames.map(name => [
    name,
    [...(data[name] || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)))
  ]))
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex')
}

async function readCollections() {
  const database = mongoose.connection.db
  const data = {}
  for (const name of collectionNames) {
    const collection = database.collection(name)
    const documents = await collection.find({}).sort({ _syncPosition: 1, createdAt: 1 }).toArray()
    for (const document of documents) {
      if (!document._syncId) {
        const id = String(document.id || document._id)
        await collection.updateOne({ _id: document._id }, { $set: { id, _syncId: id, _syncedAt: new Date() } })
        document.id = id
        document._syncId = id
      }
    }
    data[name] = documents.map(cleanRemoteDocument)
  }
  return data
}

async function updateSnapshot(data) {
  const updated = await OfflineSnapshot.findOneAndUpdate(
    { key: snapshotKey },
    { $set: { data, sourceId: state.sourceId }, $inc: { revision: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean()
  state.lastRevision = updated.revision
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
      await updateSnapshot(snapshotData())
      state.dirty = false
    } else if (!state.collectionHash) {
      await mirrorCollections(snapshotData())
      state.collectionHash = dataHash(await readCollections())
    } else {
      const collectionData = await readCollections()
      const remoteCollectionHash = dataHash(collectionData)
      if (remoteCollectionHash !== state.collectionHash) {
        replaceStore(collectionData)
        await updateSnapshot(collectionData)
      } else if (remote.revision > state.lastRevision) {
        replaceStore(remote.data)
        state.lastRevision = remote.revision
      }
    }
    if (remote?.revision > state.lastRevision && !state.dirty && state.collectionHash) {
      replaceStore(remote.data)
      state.lastRevision = remote.revision
    }
    await mirrorCollections(snapshotData())
    state.collectionHash = dataHash(await readCollections())
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
