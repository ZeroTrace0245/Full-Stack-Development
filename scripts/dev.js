import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const backendEntry = fileURLToPath(new URL('../backend/server.js', import.meta.url));
const viteEntry = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));

const processes = [
  spawn(process.execPath, [backendEntry], { stdio: 'inherit' }),
  spawn(process.execPath, [viteEntry], { stdio: 'inherit' })
];

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

for (const child of processes) {
  child.on('error', (error) => {
    console.error(`Failed to start development service: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping && code !== 0 && signal == null) stop(code ?? 1);
  });
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
