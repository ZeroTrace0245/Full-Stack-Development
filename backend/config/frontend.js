import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function serveFrontend(app, directory) {
  const index = join(directory, 'index.html');
  if (!existsSync(index)) throw new Error('Frontend build missing. Run npm run build from the repository root.');
  app.use(['/api', '/socket.io'], (_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(express.static(directory));
  app.get('*', (req, res, next) => {
    if (!req.accepts('html') || /\.[^/]+$/.test(req.path)) return next();
    res.sendFile(index);
  });
}
