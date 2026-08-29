import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, description: { type: String, default: '' },
  boardId: { type: String, default: 'board-1', index: true }, columnId: { type: String, required: true },
  assignee: { type: String, default: '' }, priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  type: { type: String, enum: ['Feature', 'Bug', 'UI'], default: 'Feature' }, dueDate: { type: String, default: '' },
  estimate: { type: Number, default: 0 }, order: { type: Number, default: 0 },
  assignedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, assignmentLocked: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

taskSchema.set('toJSON', { transform(_document, result) { result.id = result._id.toString(); delete result._id; delete result.__v; return result } })

export default mongoose.model('Task', taskSchema)
