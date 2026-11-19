import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { repoRoot } from './repo-root.mjs';

const outDir = join(repoRoot, 'docs/screenshots/pr-131-gate');
const beforeDir = join(outDir, 'before');
const afterDir = join(outDir, 'after');
mkdirSync(beforeDir, { recursive: true });
mkdirSync(afterDir, { recursive: true });

const BEFORE_REF =
  process.env.SCREENSHOT_BEFORE_REF ||
  '9791d43d67279d7725d6a1f7865ff10deaf36ba5';

const shots = [
  {
    file: 'button-tonal-custom-ios-light-rest-mobile.png',
    query: '?scene=button-tonal-custom&theme=ios&dark=0',
    press: false,
  },
  {
    file: 'button-tonal-custom-ios-light-pressed-mobile.png',
    query: '?scene=button-tonal-custom&theme=ios&dark=0',
    press: true,
    probe: '#capture-tonal-custom',
  },
  {
    file: 'button-tonal-custom-ios-dark-rest-mobile.png',
    query: '?scene=button-tonal-custom&theme=ios&dark=1',
    press: false,
  },
  {
    file: 'button-outline-ios-light-rest-mobile.png',
    query: '?scene=button-outline&theme=ios&dark=0',
    press: false,
  },
  {
    file: 'button-outline-ios-light-pressed-mobile.png',
    query: '?scene=button-outline&theme=ios&dark=0',
    press: true,
    probe: '#capture-outline',
  },
  {
    file: 'progressbar-material-light-mobile.png',
    query: '?scene=progressbar-material&theme=material&dark=0',
    press: false,
    probe: '#capture-progressbar',
  },
  {
    file: 'progressbar-material-dark-mobile.png',
    query: '?scene=progressbar-material&theme=material&dark=1',
    press: false,
    probe: '#capture-progressbar',
  },
  {
    file: 'navbar-ios-light-scrolled-mobile.png',
    query: '?scene=navbar-scroll&theme=ios&dark=0',
    scrollY: 420,
    press: false,
  },
];

function assertSpawnOk(result, label) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} exited with status ${result.status ?? 'unknown'}`);
  }
}

async function waitForUrl(url, attempts = 160) {
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

function prepareExampleRoot(root, syncCaptureUiFromHead = false) {
  if (syncCaptureUiFromHead) {
    cpSync(join(repoRoot, 'example/src/CaptureDemo.vue'), join(root, 'example/src/CaptureDemo.vue'));
    cpSync(join(repoRoot, 'example/src/App.vue'), join(root, 'example/src/App.vue'));
    cpSync(join(repoRoot, 'example/src/style.css'), join(root, 'example/src/style.css'));
  }
  assertSpawnOk(
    spawnSync('npm', ['ci'], { cwd: root, stdio: 'inherit' }),
    'npm ci (root)',
  );
  assertSpawnOk(
    spawnSync('npm', ['ci'], { cwd: join(root, 'example'), stdio: 'inherit' }),
    'npm ci (example)',
  );
  assertSpawnOk(
    spawnSync('npm', ['run', 'build:registry'], { cwd: root, stdio: 'inherit' }),
    'build:registry',
  );
  assertSpawnOk(
    spawnSync('npm', ['run', 'sync:example'], { cwd: root, stdio: 'inherit' }),
    'sync:example',
  );
  assertSpawnOk(
    spawnSync('npm', ['run', 'build'], { cwd: join(root, 'example'), stdio: 'inherit' }),
    'example build',
  );
}

async function captureSet({ exampleCwd, port, destDir }) {
  const distDir = join(exampleCwd, 'dist');
  const server = spawn(
    'npx',
  ['http-server@14.1.1', distDir, '-a', '127.0.0.1', '-p', String(port), '-c-1'],
    { cwd: exampleCwd, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  server.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk);
  });
  const baseUrl = `http://127.0.0.1:${port}/`;
  let browser;
  try {
    await sleep(1500);
    await waitForUrl(baseUrl);
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 390, height: 844 });

    for (const shot of shots) {
      await page.goto(`${baseUrl}${shot.query}`, {
        waitUntil: 'domcontentloaded',
        timeout: 120_000,
      });
      await sleep(300);
      if (shot.scrollY != null) {
        await page.evaluate(`window.scrollTo(0, ${shot.scrollY})`);
        await sleep(200);
      }
      if (shot.press && shot.probe) {
        const box = await page.locator(shot.probe).boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await sleep(120);
        }
      }
      await page.screenshot({ path: join(destDir, shot.file) });
      if (shot.press) {
        await page.mouse.up();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
    await sleep(500);
  }
}

const skipBefore =
  process.env.CAPTURE_SKIP_BEFORE === '1' &&
  shots.every((s) => existsSync(join(beforeDir, s.file)));

if (!skipBefore) {
  const beforeRoot = mkdtempSync(join(tmpdir(), 'tc-gate-before-'));
  const checkout = spawnSync(
    'git',
    ['worktree', 'add', '--detach', beforeRoot, BEFORE_REF],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  if (checkout.status !== 0) {
    console.error(checkout.stderr);
    process.exit(1);
  }
  try {
    prepareExampleRoot(beforeRoot, true);
    await captureSet({
      exampleCwd: join(beforeRoot, 'example'),
      port: 4282,
      destDir: beforeDir,
    });
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', beforeRoot], {
      cwd: repoRoot,
    });
  }
} else {
  console.log('capture: skipping before (CAPTURE_SKIP_BEFORE=1)');
}

prepareExampleRoot(repoRoot, false);
await captureSet({
  exampleCwd: join(repoRoot, 'example'),
  port: 4283,
  destDir: afterDir,
});

console.log(`wrote before shots to ${beforeDir}`);
console.log(`wrote after shots to ${afterDir}`);