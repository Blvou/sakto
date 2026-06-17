#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mode = process.argv[2] ?? 'all';

const scripts = {
  static: path.join(__dirname, 'static-audit.mjs'),
  live: path.join(__dirname, 'live-audit.mjs'),
};

function run(label, script) {
  console.log(`\n${'='.repeat(60)}\nRunning ${label}...\n${'='.repeat(60)}`);
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  return result.status ?? 1;
}

let exitCode = 0;

if (mode === 'static' || mode === 'all') {
  exitCode = run('static audit', scripts.static) || exitCode;
}

if (mode === 'live' || mode === 'all') {
  const liveCode = run('live audit', scripts.live);
  if (liveCode !== 0) exitCode = liveCode || exitCode;
}

process.exit(exitCode);
