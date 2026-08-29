import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['Admin', 'Standard User'], default: 'Standard User' },
  lastLogin: Date
}, { timestamps: true })

userSchema.set('toJSON', { transform(_document, result) { result.id = result._id.toString(); delete result._id; delete result.__v; delete result.passwordHash; return result } })

export default mongoose.model('User', userSchema)
