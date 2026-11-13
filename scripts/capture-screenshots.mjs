import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { repoRoot } from './repo-root.mjs';

const outDir = join(repoRoot, 'docs/screenshots');
mkdirSync(outDir, { recursive: true });

const AFTER_ONLY = process.env.CAPTURE_AFTER_ONLY === '1';
const BEFORE_COMMIT = process.env.SCREENSHOT_BEFORE_COMMIT || 'e6437809852749b566a8489cd59db362006741f0';

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

async function applyTheme(page, { ios, material, light, dark }) {
  if (ios) await page.getByRole('button', { name: 'iOS', exact: true }).click();
  if (material) {
    await page.getByRole('button', { name: 'Material', exact: true }).click();
  }
  if (light) await page.getByRole('button', { name: 'Light', exact: true }).click();
  if (dark) await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await sleep(300);
}

async function captureSet({ cwd, port, shots }) {
  const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
    cwd,
    stdio: 'pipe',
  });
  const url = `http://127.0.0.1:${port}/`;
  await waitForUrl(url);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(url, { waitUntil: 'networkidle' });
    if (shot.theme) await applyTheme(page, shot.theme);
    await page.screenshot({ path: join(outDir, shot.name) });
  }

  await browser.close();
  server.kill('SIGTERM');
}

if (!AFTER_ONLY) {
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

  await captureSet({
    cwd: join(beforeRoot, 'example'),
    port: 4174,
    shots: [
      { name: 'before-desktop.png', width: 1280, height: 800 },
      { name: 'before-mobile.png', width: 390, height: 844 },
    ],
  });

  spawnSync('git', ['worktree', 'remove', '--force', beforeRoot], { cwd: repoRoot });
}

if (!process.env.SKIP_REGISTRY_SYNC) {
  spawnSync('npm', ['run', 'sync:example'], { cwd: repoRoot, stdio: 'inherit' });
}

await captureSet({
  cwd: join(repoRoot, 'example'),
  port: 4173,
  shots: [
    { name: 'after-desktop.png', width: 1280, height: 800, theme: { ios: true, light: true } },
    { name: 'after-mobile.png', width: 390, height: 844, theme: { ios: true, light: true } },
    {
      name: 'after-desktop-dark.png',
      width: 1280,
      height: 800,
      theme: { ios: true, dark: true },
    },
    {
      name: 'after-desktop-material.png',
      width: 1280,
      height: 800,
      theme: { material: true, light: true },
    },
  ],
});

const files = [
  'before-desktop.png',
  'before-mobile.png',
  'after-desktop.png',
  'after-mobile.png',
  'after-desktop-dark.png',
  'after-desktop-material.png',
].filter((name) => {
  try {
    return existsSync(join(outDir, name));
  } catch {
    return false;
  }
});

const digests = spawnSync('sha256sum', files.map((f) => join(outDir, f)), {
  encoding: 'utf8',
});
console.log(digests.stdout);
console.log(`wrote screenshots to ${outDir}`);
