import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { repoRoot } from './repo-root.mjs';

const outDir = join(repoRoot, 'docs/screenshots/pr-130-followups');
mkdirSync(outDir, { recursive: true });

const scenes = [
  { key: 'tonal-custom', query: '?scene=button-tonal-custom&theme=ios&dark=0' },
  { key: 'angular-buttons-note', query: '?scene=button-outline&theme=ios&dark=0' },
  { key: 'progressbar-material', query: '?scene=progressbar-material&theme=material&dark=0' },
  { key: 'navbar-mobile', query: '?theme=ios&dark=0' },
];

async function waitForUrl(url, attempts = 60) {
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

spawnSync('npm', ['run', 'sync:example'], { cwd: repoRoot, stdio: 'inherit' });
spawnSync('npm', ['run', 'build'], {
  cwd: join(repoRoot, 'example'),
  stdio: 'inherit',
});

const port = 4181;
const server = spawn(
  'npm',
  ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)],
  { cwd: join(repoRoot, 'example'), stdio: 'pipe' },
);

const baseUrl = `http://127.0.0.1:${port}/`;
await waitForUrl(baseUrl, 80);

const browser = await chromium.launch();
const page = await browser.newPage();

for (const scene of scenes) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}${scene.query}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  if (scene.key === 'navbar-mobile') {
    await page.waitForSelector('.demo-page .c-navbar', { timeout: 30_000 });
    await page.evaluate(() => window.scrollTo(0, 420));
    await sleep(200);
    await page.screenshot({
      path: join(outDir, `after-${scene.key}-mobile.png`),
    });
    continue;
  }
  await sleep(250);
  if (scene.key.includes('tonal') || scene.key.includes('angular')) {
    const probe =
      scene.key === 'tonal-custom' ? '#capture-tonal-custom' : '#capture-outline';
    const box = await page.locator(probe).boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await sleep(80);
    }
  }
  await page.screenshot({
    path: join(outDir, `after-${scene.key}-mobile.png`),
  });
  await page.mouse.up();
}

await browser.close();
server.kill('SIGTERM');
console.log(`wrote follow-up screenshots to ${outDir}`);