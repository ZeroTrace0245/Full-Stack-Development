import { initializeStore } from '../db/mockStore.js'

export const isMockData = () => true

export async function connectDatabase() {
  const path = initializeStore()
  console.log(`✅ Using persistent local storage: ${path}`)
  return null
}

export async function closeDatabase() {
  return null
}
