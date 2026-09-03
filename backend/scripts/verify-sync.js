import dns from 'node:dns'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })
dns.setServers(['8.8.8.8', '1.1.1.1'])

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME })
  for (const name of ['users', 'tasks', 'messages', 'offline_snapshots']) {
    const count = await mongoose.connection.db.collection(name).countDocuments()
    console.log(`${name}: ${count}`)
  }
} finally {
  await mongoose.disconnect()
}
