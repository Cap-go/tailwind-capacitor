import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { repoRoot } from './repo-root.mjs';

const outDir = join(repoRoot, 'docs/screenshots');
mkdirSync(outDir, { recursive: true });

const BEFORE_COMMIT = process.env.SCREENSHOT_BEFORE_COMMIT || 'f8d631a';

async function waitForUrl(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await sleep(500);
  }
  throw new Error(`server did not respond at ${url}`);
}

async function captureSet({ cwd, port, prefix }) {
  const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
    cwd,
    stdio: 'pipe',
  });
  const url = `http://127.0.0.1:${port}/`;
  await waitForUrl(url);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  async function shot(name, width, height) {
    await page.setViewportSize({ width, height });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(outDir, name) });
  }

  await shot(`${prefix}-desktop.png`, 1280, 800);
  await shot(`${prefix}-mobile.png`, 390, 844);

  await browser.close();
  server.kill('SIGTERM');
}

const beforeRoot = mkdtempSync(join(tmpdir(), 'tc-before-'));
const checkout = spawnSync('git', ['worktree', 'add', '--detach', beforeRoot, BEFORE_COMMIT], {
  cwd: repoRoot,
  encoding: 'utf8',
});
if (checkout.status !== 0) {
  console.error(checkout.stderr);
  process.exit(1);
}

spawnSync('npm', ['ci'], { cwd: beforeRoot, stdio: 'inherit' });
spawnSync('npm', ['ci'], { cwd: join(beforeRoot, 'example'), stdio: 'inherit' });

await captureSet({ cwd: join(beforeRoot, 'example'), port: 4174, prefix: 'before' });

spawnSync('git', ['worktree', 'remove', '--force', beforeRoot], { cwd: repoRoot });

spawnSync('npm', ['run', 'sync:example'], { cwd: repoRoot, stdio: 'inherit' });

await captureSet({ cwd: join(repoRoot, 'example'), port: 4173, prefix: 'after' });

const digests = spawnSync(
  'sha256sum',
  [
    join(outDir, 'before-desktop.png'),
    join(outDir, 'after-desktop.png'),
    join(outDir, 'before-mobile.png'),
    join(outDir, 'after-mobile.png'),
  ],
  { encoding: 'utf8' },
);
console.log(digests.stdout);
console.log(`wrote screenshots to ${outDir}`);
