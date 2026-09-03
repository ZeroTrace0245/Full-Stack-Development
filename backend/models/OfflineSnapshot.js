import mongoose from 'mongoose'

const offlineSnapshotSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  revision: { type: Number, required: true, default: 0 },
  sourceId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true, collection: 'offline_snapshots' })

export default mongoose.model('OfflineSnapshot', offlineSnapshotSchema)
