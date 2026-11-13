import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';

const outDir = new URL('../docs/screenshots', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: new URL('../example', import.meta.url).pathname,
  stdio: 'pipe',
});

await sleep(4000);

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(name, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${outDir}/${name}` });
}

await shot('after-desktop.png', 1280, 800);
await shot('after-mobile.png', 390, 844);

await browser.close();
server.kill('SIGTERM');
console.log(`wrote screenshots to ${outDir}`);
