import { useState } from 'react'

export function readPreference(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback } catch { return fallback }
}
export function writePreference(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { /* Preferences are optional. */ }
}
export function usePreference(key, fallback) {
  const [entry, setEntry] = useState(() => ({ key, value: readPreference(key, fallback) }))
  const value = entry.key === key ? entry.value : readPreference(key, fallback)
  if (entry.key !== key) setEntry({ key, value })
  const setValue = next => {
    const updated = typeof next === 'function' ? next(value) : next
    writePreference(key, updated)
    setEntry({ key, value: updated })
  }
  return [value, setValue]
}
