import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { repoRoot } from './repo-root.mjs';

const outDir = join(repoRoot, 'docs/screenshots');
mkdirSync(outDir, { recursive: true });

const AFTER_ONLY = process.env.CAPTURE_AFTER_ONLY === '1';
const BEFORE_ONLY = process.env.CAPTURE_BEFORE_ONLY === '1';
const BEFORE_REF =
  process.env.SCREENSHOT_BEFORE_REF || 'origin/main';

const THEME_MATRIX = [
  { key: 'ios-light', query: '?theme=ios&dark=0' },
  { key: 'ios-dark', query: '?theme=ios&dark=1' },
  { key: 'material-light', query: '?theme=material&dark=0' },
  { key: 'material-dark', query: '?theme=material&dark=1' },
];

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

async function captureSet({ cwd, port, shots, preview = false, requireThemeChip = true }) {
  const server = spawn(
    preview ? 'npm' : 'npm',
    preview
      ? ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)]
      : ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd,
      stdio: 'pipe',
    },
  );
  const url = `http://127.0.0.1:${port}/`;
  await waitForUrl(url, requireThemeChip ? 40 : 120);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    const target = shot.query ? `${url.split('?')[0]}${shot.query}` : url;
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (requireThemeChip) {
      await page.waitForSelector('.demo-shell .theme-chip', { timeout: 30_000 });
    } else {
      await page.waitForSelector('body', { timeout: 30_000 });
      await sleep(500);
    }
    await page.evaluate('window.scrollTo(0, 0)');
    await page.evaluate('window.scrollTo(0, 0)');
    await sleep(150);
    await page.screenshot({
      path: join(outDir, shot.name),
      fullPage: !!shot.fullPage,
    });
  }

  await browser.close();
  server.kill('SIGTERM');
}

if (!AFTER_ONLY) {
  const beforeRoot = mkdtempSync(join(tmpdir(), 'tc-before-'));
  const checkout = spawnSync(
    'git',
    ['worktree', 'add', '--detach', beforeRoot, BEFORE_REF],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  );
  if (checkout.status !== 0) {
    console.error(checkout.stderr);
    process.exit(1);
  }

  spawnSync('npm', ['ci'], { cwd: beforeRoot, stdio: 'inherit' });
  spawnSync('npm', ['ci'], { cwd: join(beforeRoot, 'example'), stdio: 'inherit' });
  spawnSync('npm', ['run', 'build:registry'], {
    cwd: beforeRoot,
    stdio: 'inherit',
  });
  spawnSync('npm', ['run', 'sync:example'], {
    cwd: beforeRoot,
    stdio: 'inherit',
  });
  spawnSync('npm', ['run', 'build'], {
    cwd: join(beforeRoot, 'example'),
    stdio: 'inherit',
  });

  await captureSet({
    cwd: join(beforeRoot, 'example'),
    port: 4174,
    requireThemeChip: false,
    shots: [
      { name: 'before-desktop.png', width: 1280, height: 800, fullPage: true },
      { name: 'before-mobile.png', width: 390, height: 844, fullPage: true },
    ],
    preview: true,
  });

  spawnSync('git', ['worktree', 'remove', '--force', beforeRoot], { cwd: repoRoot });
}

if (!BEFORE_ONLY && !process.env.SKIP_REGISTRY_SYNC) {
  spawnSync('npm', ['run', 'sync:example'], { cwd: repoRoot, stdio: 'inherit' });
}

const afterShots = [];
for (const { key, query } of THEME_MATRIX) {
  afterShots.push({
    name: `after-${key}-desktop.png`,
    width: 1280,
    height: 800,
    query,
    fullPage: true,
  });
  afterShots.push({
    name: `after-${key}-mobile.png`,
    width: 390,
    height: 844,
    query,
    fullPage: true,
  });
}

if (BEFORE_ONLY) {
  console.log('capture: before-only complete');
  process.exit(0);
}

spawnSync('npm', ['run', 'build'], {
  cwd: join(repoRoot, 'example'),
  stdio: 'inherit',
});

await captureSet({
  cwd: join(repoRoot, 'example'),
  port: 4173,
  shots: afterShots,
  preview: true,
});

const files = [
  'before-desktop.png',
  'before-mobile.png',
  ...afterShots.map((s) => s.name),
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
