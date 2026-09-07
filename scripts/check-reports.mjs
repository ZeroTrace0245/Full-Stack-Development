import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Render both empty and dense preview states without requesting live APIs.
globalThis.localStorage = { getItem: () => null }
globalThis.sessionStorage = { getItem: () => null }
globalThis.window = { location: { search: '' } }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: Reports } = await server.ssrLoadModule('/src/pages/Reports.jsx')
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.jsx')
  const { BoardProvider } = await server.ssrLoadModule('/src/context/BoardContext.jsx')
  const render = () => renderToStaticMarkup(React.createElement(AuthProvider, null, React.createElement(BoardProvider, null, React.createElement(Reports))))
  const empty = render()
  assert.ok(empty.includes('Your next sprint starts here.'))
  assert.ok(empty.includes('No hardware monitoring feed is connected.'))
  assert.ok(!empty.includes('NaN'))
  window.location.search = '?reportsPreview=stress'
  const dense = render()
  assert.ok(dense.includes('42 tasks complete.'))
  assert.ok(dense.includes('Integration'))
  assert.ok(dense.includes('prerequisite(s)'))
  assert.ok(dense.includes('31.8 °C'))
  assert.ok(dense.includes('Activity replay'))
  assert.ok(!dense.includes('NaN'))
  assert.equal((dense.match(/role="img"/g) || []).length, 43)
  console.log('Reports smoke check passed: empty state and 42-task stress preview, including schedule, additional task types, sensor samples and activity history.')
} finally {
  await server.close()
}
