import mongoose from 'mongoose'
import dns from 'node:dns'
import { initializeStore } from '../db/mockStore.js'
import { startOfflineSync, stopOfflineSync } from '../services/offlineSync.js'

let syncInterval = null

// Routes always use the durable JSON store. Atlas is its online synchronized mirror.
export const isMockData = () => true

export async function connectDatabase() {
  const path = initializeStore()
  console.log(`✅ Using offline-first local storage: ${path}`)
  const mongoUri = process.env.MONGODB_URI?.trim()

  if (mongoUri) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    const options = { serverSelectionTimeoutMS: 10000 }
    if (process.env.MONGODB_DB_NAME?.trim()) options.dbName = process.env.MONGODB_DB_NAME.trim()
    try {
      await mongoose.connect(mongoUri, options)
      console.log(`✅ Atlas sync connected: ${mongoose.connection.name}`)
      syncInterval = startOfflineSync()
      return mongoose.connection
    } catch (error) {
      console.warn(`⚠️ Atlas unavailable; continuing offline: ${error.message}`)
      void retryAtlas(mongoUri, options)
    }
  }
  return null
}

async function retryAtlas(mongoUri, options) {
  const retryMs = Number(process.env.SYNC_RETRY_MS) || 15000
  while (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => setTimeout(resolve, retryMs))
    try { await mongoose.connect(mongoUri, options); console.log(`✅ Atlas reconnected: ${mongoose.connection.name}`); syncInterval = startOfflineSync() }
    catch { /* Remain offline and retry. */ }
  }
}

export async function closeDatabase() {
  stopOfflineSync()
  if (syncInterval) clearInterval(syncInterval)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  return null
}
