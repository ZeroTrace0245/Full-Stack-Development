import mongoose from 'mongoose'

export const useMockData = () => process.env.USE_MOCK_DATA !== 'false'

export async function connectDatabase() {
  if (useMockData()) {
    console.log('✅ Using in-memory mock data (Milestone 2 mode)')
    return null
  }
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novasync'
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  console.log('✅ Connected to MongoDB successfully')
  return mongoose.connection
}

export async function closeDatabase() {
  if (useMockData()) return
  await mongoose.disconnect()
  console.log('MongoDB connection closed')
}
