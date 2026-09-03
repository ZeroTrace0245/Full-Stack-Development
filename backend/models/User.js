import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['Admin', 'Standard User'], default: 'Standard User' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 160 },
  timezone: { type: String, default: 'Asia/Colombo' },
  preferences: { emailNotifications: { type: Boolean, default: true }, compactMode: { type: Boolean, default: false }, theme: { type: String, enum: ['dark', 'light'], default: 'dark' } },
  lastLogin: Date
}, { timestamps: true })

userSchema.set('toJSON', { transform(_document, result) { result.id = result._id.toString(); delete result._id; delete result.__v; delete result.passwordHash; return result } })

export default mongoose.model('User', userSchema)
