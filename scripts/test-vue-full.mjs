import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { repoRoot } from './repo-root.mjs';

function installOrderPriority(name) {
  const order = [
    'capacitor-tailwind.json',
    'capacitor-shared.json',
    'capacitor-provider.json',
    'capacitor-icons.json',
  ];
  const idx = order.indexOf(name);
  return idx === -1 ? 100 : idx;
}

async function waitForUrl(url, attempts = 80) {
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

const addScript = join(repoRoot, 'scripts/registry-add.mjs');
const publicRoot = join(repoRoot, 'public/r');
const vuePublic = join(publicRoot, 'vue');
const work = mkdtempSync(join(tmpdir(), 'tc-vue-full-'));
const appDir = join(work, 'vue-app');
const registryEnv = { ...process.env, REGISTRY_ROOT: publicRoot };

const scaffold = spawnSync(
  'npm',
  ['create', 'vite@latest', 'vue-app', '--', '--template', 'vue'],
  { cwd: work, stdio: 'inherit' },
);
if (scaffold.status !== 0) process.exit(scaffold.status ?? 1);

const npmInstall = spawnSync('npm', ['install'], { cwd: appDir, stdio: 'inherit' });
if (npmInstall.status !== 0) process.exit(npmInstall.status ?? 1);

cpSync(join(repoRoot, 'components-vue.json'), join(appDir, 'components.json'));
cpSync(join(repoRoot, 'jsconfig.json'), join(appDir, 'jsconfig.json'));
writeFileSync(
  join(appDir, 'src/style.css'),
  '@import "@/capacitor/styles/tailwind-capacitor.css";\n',
);

writeFileSync(
  join(appDir, 'vite.config.js'),
  `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
});
`,
);

const extraDeps = spawnSync(
  'npm',
  ['install', '@tailwindcss/vite@^4.1.11', 'tailwindcss@^4.1.11'],
  { cwd: appDir, stdio: 'inherit' },
);
if (extraDeps.status !== 0) process.exit(extraDeps.status ?? 1);

const rootItems = [
  join(publicRoot, 'capacitor-tailwind.json'),
  join(publicRoot, 'capacitor-shared.json'),
];
const vueItems = readdirSync(vuePublic)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .sort((a, b) => {
    const d = installOrderPriority(a) - installOrderPriority(b);
    return d !== 0 ? d : a.localeCompare(b);
  })
  .map((name) => join(vuePublic, name));

for (const item of [...rootItems, ...vueItems]) {
  const result = spawnSync('node', [addScript, item], {
    cwd: appDir,
    stdio: 'pipe',
    encoding: 'utf8',
    env: registryEnv,
  });
  if (result.status !== 0) {
    console.error(`registry-add failed: ${item}`);
    console.error(result.stdout);
    console.error(result.stderr);
    rmSync(work, { recursive: true, force: true });
    process.exit(1);
  }
}

const componentsDir = join(appDir, 'src/capacitor/vue/components');
const componentFiles = readdirSync(componentsDir).filter(
  (name) => name.endsWith('.vue') && statSync(join(componentsDir, name)).isFile(),
);

if (!componentFiles.length) {
  console.error('no vue components installed');
  process.exit(1);
}

writeFileSync(
  join(appDir, 'src/App.vue'),
  `<script>
import TailwindCapacitorProvider from '@/capacitor/vue/shared/TailwindCapacitorProvider.vue';
import Button from '@/capacitor/vue/components/Button.vue';

export default {
  name: 'SmokeApp',
  components: { TailwindCapacitorProvider, Button },
};
</script>

<template>
  <TailwindCapacitorProvider :dark="false">
    <div id="smoke-root">
      <Button>ok</Button>
    </div>
  </TailwindCapacitorProvider>
</template>
`,
);

writeFileSync(
  join(appDir, 'src/main.js'),
  `import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

createApp(App).mount('#app');
`,
);

const build = spawnSync('npm', ['run', 'build'], { cwd: appDir, stdio: 'inherit' });
if (build.status !== 0) {
  rmSync(work, { recursive: true, force: true });
  process.exit(build.status ?? 1);
}

const port = 45000 + Math.floor(Math.random() * 5000);
const baseUrl = `http://127.0.0.1:${port}/`;
const server = spawn(
  'npx',
  ['vite', '--port', String(port), '--host', '127.0.0.1'],
  { cwd: appDir, stdio: 'ignore' },
);

try {
  await waitForUrl(baseUrl, 120);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('#smoke-root', {
    state: 'attached',
    timeout: 60_000,
  });
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await sleep(300);
  if (errors.length) {
    throw new Error(`runtime errors: ${errors.join('; ')}`);
  }
  await browser.close();
} finally {
  server.kill('SIGTERM');
  await sleep(2000);
  try {
    rmSync(work, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 500,
    });
  } catch (error) {
    console.warn(`cleanup skipped: ${error.message}`);
  }
}

console.log('test-vue-full: ok');