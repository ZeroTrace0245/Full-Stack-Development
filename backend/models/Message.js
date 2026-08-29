import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  kind: { type: String, enum: ['team', 'direct'], required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: String, content: { type: String, required: true, trim: true }
}, { timestamps: true })

messageSchema.set('toJSON', { transform(_document, result) { result.id = result._id.toString(); delete result._id; delete result.__v; return result } })

export default mongoose.model('Message', messageSchema)
