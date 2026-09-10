import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { serveFrontend } from './frontend.js';

test('production frontend serves HTML without masking API or missing asset responses', async () => {
  const app = express();
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  serveFrontend(app, fileURLToPath(new URL('../../dist/', import.meta.url)));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/', '/dashboard']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(await response.text(), /id="root"/);
    }
    assert.deepEqual(await (await fetch(base + '/api/health')).json(), { ok: true });
    for (const path of ['/api/missing', '/socket.io/missing', '/missing.js']) {
      assert.equal((await fetch(base + path)).status, 404);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
