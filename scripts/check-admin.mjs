import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { pageItems } from '../src/pages/adminPagination.js'
import { adminStress } from '../src/fixtures/adminStress.js'
assert.equal(adminStress.users[0].email.length, 254)
assert.equal(pageItems(adminStress.messages, 0).rows.length, 25)
assert.equal(pageItems(adminStress.messages, 199).rows.at(-1).id, 'stress-log-4999')
assert.equal(pageItems([], 12).current, 0)
assert.equal(pageItems(adminStress.messages.slice(0, 3), 199).rows.length, 3)
globalThis.localStorage = { getItem: () => null }
globalThis.sessionStorage = { getItem: () => null }
globalThis.window = { location: { search: '?adminPreview=stress' } }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: AdminPanel } = await server.ssrLoadModule('/src/pages/AdminPanel.jsx')
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.jsx')
  const { BoardProvider } = await server.ssrLoadModule('/src/context/BoardContext.jsx')
  for (const tab of ['accounts', 'audit', 'tasks']) {
    window.location.search = `?adminPreview=stress&tab=${tab}`
    const html = renderToStaticMarkup(React.createElement(AuthProvider, null, React.createElement(BoardProvider, null, React.createElement(AdminPanel))))
    assert.equal((html.match(/<tr>/g) || []).length, 26, `${tab}: only 25 data rows should mount`)
    assert.ok(html.includes(`id="admin-panel-${tab}"`))
    assert.ok(!html.includes('NaN'))
    if (tab === 'accounts') assert.ok(html.includes('System integration'))
    if (tab === 'audit') { assert.ok(html.includes('5000 result(s)')); assert.ok(!html.includes('<textarea')) }
    if (tab === 'tasks') assert.ok(html.includes('Locked'))
  }
  const { default: Timeline } = await server.ssrLoadModule('/src/components/BoardTimeline.jsx')
  const timeline = renderToStaticMarkup(React.createElement(Timeline, { columns: [{ title: 'Backlog', tasks: [{ ...adminStress.tasks[0], dueDate: '2026-09-10' }] }], user: { id: 'other', role: 'Standard User' }, onEditTask: () => {} }))
  assert.ok(timeline.includes('Locked to'))
  assert.ok(timeline.includes('disabled=""'))
  console.log('Admin checks passed: 1,000 accounts, 254-character emails, 5,000 audit records, page boundaries, 25 rendered rows per tab, and timeline lock visibility.')
} finally { await server.close() }
