import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
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

const CLIP_PADDING = 16;
const MIN_CLIP_HEIGHT = 24;
const MAX_EMPTY_CLIP_RATIO = 0.65;

const shots = [
  {
    file: 'button-tonal-custom-ios-light-rest-mobile.png',
    query: '?scene=button-tonal-custom&theme=ios&dark=0',
    press: false,
    clip: '#capture-tonal-custom',
  },
  {
    file: 'button-tonal-custom-ios-light-pressed-mobile.png',
    query: '?scene=button-tonal-custom&theme=ios&dark=0',
    press: true,
    clip: '#capture-tonal-custom',
  },
  {
    file: 'button-tonal-custom-ios-dark-rest-mobile.png',
    query: '?scene=button-tonal-custom&theme=ios&dark=1',
    press: false,
    clip: '#capture-tonal-custom',
  },
  {
    file: 'button-outline-ios-light-rest-mobile.png',
    query: '?scene=button-outline&theme=ios&dark=0',
    press: false,
    clip: '#capture-outline',
  },
  {
    file: 'button-outline-ios-light-pressed-mobile.png',
    query: '?scene=button-outline&theme=ios&dark=0',
    press: true,
    clip: '#capture-outline',
  },
  {
    file: 'progressbar-material-light-mobile.png',
    query: '?scene=progressbar-material&theme=material&dark=0',
    press: false,
    clip: '#capture-progressbar',
  },
  {
    file: 'progressbar-material-dark-mobile.png',
    query: '?scene=progressbar-material&theme=material&dark=1',
    press: false,
    clip: '#capture-progressbar',
  },
  {
    file: 'navbar-ios-light-scrolled-mobile.png',
    query: '?scene=navbar-scroll&theme=ios&dark=0',
    scrollY: 420,
    press: false,
    fixedClip: { x: 0, y: 0, width: 390, height: 112 },
  },
];

function assertSpawnOk(result, label) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} exited with status ${result.status ?? 'unknown'}`);
  }
}

function assertPngHasContent(pngPath, label) {
  const stat = spawnSync(
    'python3',
    [
      '-c',
      `from PIL import Image
import sys
p=sys.argv[1]
im=Image.open(p).convert('RGB')
w,h=im.size
colors=set(im.getdata())
if w*h>90000 and len(colors)<3:
    raise SystemExit('mostly empty frame')
if len(colors)<2:
    raise SystemExit('flat frame')
# dominant color must not cover whole clip when clip is tall
if h>120:
    from collections import Counter
    c=Counter(im.getdata())
    top,_=c.most_common(1)[0]
    if top/(w*h)>${MAX_EMPTY_CLIP_RATIO}:
        raise SystemExit('dominant color covers too much of clip')
print('ok')`,
      pngPath,
    ],
    { encoding: 'utf8' },
  );
  if (stat.status !== 0) {
    throw new Error(
      `${label}: screenshot content check failed (${stat.stdout || stat.stderr})`,
    );
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

async function resolveClip(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 15_000 });
  const box = await locator.boundingBox();
  if (!box || box.width < 8 || box.height < 2) {
    throw new Error(`capture clip missing or too small: ${selector}`);
  }
  const vp = page.viewportSize();
  const clip = {
    x: Math.max(0, Math.floor(box.x - CLIP_PADDING)),
    y: Math.max(0, Math.floor(box.y - CLIP_PADDING)),
    width: Math.min(vp.width - Math.max(0, Math.floor(box.x - CLIP_PADDING)), Math.ceil(box.width + CLIP_PADDING * 2)),
    height: Math.min(
      vp.height - Math.max(0, Math.floor(box.y - CLIP_PADDING)),
      Math.ceil(box.height + CLIP_PADDING * 2),
    ),
  };
  if (clip.height < MIN_CLIP_HEIGHT || clip.width < 8) {
    throw new Error(`capture clip too small for ${selector}: ${JSON.stringify(clip)}`);
  }
  return clip;
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
      if (shot.press && shot.clip) {
        const box = await page.locator(shot.clip).first().boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await sleep(120);
        }
      }
      const clip = shot.fixedClip
        ? shot.fixedClip
        : await resolveClip(page, shot.clip);
      const outPath = join(destDir, shot.file);
      await page.screenshot({ path: outPath, clip });
      assertPngHasContent(outPath, shot.file);
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

const afterOnly = process.env.CAPTURE_AFTER_ONLY === '1';
const beforeOnly = process.env.CAPTURE_BEFORE_ONLY === '1';

const skipBefore =
  afterOnly ||
  (process.env.CAPTURE_SKIP_BEFORE === '1' &&
    shots.every((s) => existsSync(join(beforeDir, s.file))));

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

if (!beforeOnly) {
  prepareExampleRoot(repoRoot, false);
  await captureSet({
    exampleCwd: join(repoRoot, 'example'),
    port: 4283,
    destDir: afterDir,
  });
}

for (const name of [
  'button-outline-ios-light-pressed-mobile.png',
  'navbar-ios-light-scrolled-mobile.png',
]) {
  const beforePath = join(beforeDir, name);
  const afterPath = join(afterDir, name);
  const beforeBuf = readFileSync(beforePath);
  const afterBuf = readFileSync(afterPath);
  const same = beforeBuf.equals(afterBuf);
  console.log(`capture: pixel compare ${name}: ${same ? 'identical' : 'different'}`);
}

console.log(`wrote before shots to ${beforeDir}`);
console.log(`wrote after shots to ${afterDir}`);