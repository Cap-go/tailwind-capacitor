import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './repo-root.mjs';

export function packTgz(destDir) {
  const pack = spawnSync(
    'npm',
    ['pack', '--pack-destination', destDir],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  if (pack.status !== 0) {
    console.error(pack.stderr || pack.stdout);
    throw new Error('npm pack failed');
  }
  const line = pack.stdout.trim().split('\n').filter(Boolean).pop();
  if (!line || !line.endsWith('.tgz')) {
    throw new Error(`npm pack: unexpected output: ${pack.stdout}`);
  }
  return join(destDir, line.trim());
}

export function installPackInApp(appDir, tgzPath) {
  const install = spawnSync('npm', ['install', tgzPath], {
    cwd: appDir,
    stdio: 'inherit',
  });
  if (install.status !== 0) {
    throw new Error('npm install tgz failed');
  }
  return join(appDir, 'node_modules/@capgo/tailwind-capacitor/public/r');
}