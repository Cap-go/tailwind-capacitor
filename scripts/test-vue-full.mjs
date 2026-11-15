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
import { installPackInApp, packTgz } from './full-smoke-pack.mjs';
import { assertOpenBackdropsTranslucent } from './smoke-backdrop-translucent.mjs';

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

function listVueComponentFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      out.push(...listVueComponentFiles(path));
      continue;
    }
    if (!name.endsWith('.vue')) continue;
    if (name.endsWith('Context.vue')) continue;
    out.push(path);
  }
  return out.sort();
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
const work = mkdtempSync(join(tmpdir(), 'tc-vue-full-'));
const appDir = join(work, 'vue-app');
const tgz = packTgz(work);

const scaffold = spawnSync(
  'npm',
  ['create', 'vite@latest', 'vue-app', '--', '--template', 'vue', '--no-interactive'],
  { cwd: work, stdio: 'inherit', env: { ...process.env, CI: '1' } },
);
if (scaffold.status !== 0) process.exit(scaffold.status ?? 1);

const npmInstall = spawnSync('npm', ['install'], { cwd: appDir, stdio: 'inherit' });
if (npmInstall.status !== 0) process.exit(npmInstall.status ?? 1);

const publicRoot = installPackInApp(appDir, tgz);
const vuePublic = join(publicRoot, 'vue');
const registryEnv = { ...process.env, REGISTRY_ROOT: publicRoot };

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
const registryItemNames = readdirSync(vuePublic)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .sort((a, b) => {
    const d = installOrderPriority(a) - installOrderPriority(b);
    return d !== 0 ? d : a.localeCompare(b);
  });
const vueItems = registryItemNames.map((name) => join(vuePublic, name));
const MIN_REGISTRY_COMPONENTS = registryItemNames.length - 2;

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
const componentFiles = listVueComponentFiles(componentsDir);

if (!componentFiles.length) {
  console.error('no vue components installed');
  process.exit(1);
}
if (registryItemNames.length < MIN_REGISTRY_COMPONENTS + 2) {
  throw new Error(
    `registry has ${registryItemNames.length} items, expected provider+icons+${MIN_REGISTRY_COMPONENTS} components`,
  );
}
if (componentFiles.length < MIN_REGISTRY_COMPONENTS) {
  throw new Error(
    `installed ${componentFiles.length} component files from packed tgz, expected at least ${MIN_REGISTRY_COMPONENTS}`,
  );
}
console.log(
  `test-vue-full: installed ${componentFiles.length} components from ${registryItemNames.length} registry items`,
);

const relVueImport = (abs) =>
  abs.slice(componentsDir.length + 1).replace(/\.vue$/, '');

const importLines = componentFiles
  .map((abs) => {
    const base = basename(abs, '.vue');
    const rel = relVueImport(abs);
    return `import ${base} from '@/capacitor/vue/components/${rel}.vue';`;
  })
  .join('\n');

const registerNames = componentFiles.map((n) => basename(n, '.vue'));

writeFileSync(
  join(appDir, 'src/App.vue'),
  `<script>
import TailwindCapacitorProvider from '@/capacitor/vue/shared/TailwindCapacitorProvider.vue';
${importLines}

export default {
  name: 'SmokeApp',
  components: { TailwindCapacitorProvider, ${registerNames.join(', ')} },
  data() {
    return { dark: false, backdropProbe: false };
  },
  mounted() {
    window.addEventListener('smoke-open-backdrops', () => {
      this.backdropProbe = true;
    });
  },
  methods: {
    flipDark() {
      this.dark = !this.dark;
    },
  },
};
</script>

<template>
  <TailwindCapacitorProvider :dark="dark">
    <div id="smoke-root" :class="{ dark }">
      <button id="dark-toggle" type="button" @click="flipDark">dark</button>
      <Toggle id="probe-toggle" />
      <div class="hidden" aria-hidden="true">
      ${componentFiles
        .filter((abs) => basename(abs, '.vue') !== 'Toggle')
        .map((abs) => {
          const base = basename(abs, '.vue');
          if (base === 'Button') return '<Button id="probe-button">ok</Button>';
          return `<${base} />`;
        })
        .join('\n      ')}
      </div>
      <div v-if="backdropProbe" id="backdrop-probe">
        <Sheet :opened="true" material>ok</Sheet>
        <Actions :opened="true" material>
          <ActionsGroup>
            <ActionsButton>ok</ActionsButton>
          </ActionsGroup>
        </Actions>
      </div>
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

const app = createApp(App);
app.config.errorHandler = (err) => {
  const w = window;
  w.__smokeRenderErrors = w.__smokeRenderErrors || [];
  w.__smokeRenderErrors.push(String(err));
};
app.mount('#app');
`,
);

const build = spawnSync('npm', ['run', 'build'], { cwd: appDir, stdio: 'inherit' });
if (build.status !== 0) {
  rmSync(work, { recursive: true, force: true });
  process.exit(build.status ?? 1);
}

const port = 45000 + Math.floor(Math.random() * 5000);
const baseUrl = `http://127.0.0.1:${port}/`;
const distDir = join(appDir, 'dist');
const server = spawn(
  'npx',
  [
    '--yes',
    'http-server@14.1.1',
    distDir,
    '-p',
    String(port),
    '-a',
    '127.0.0.1',
    '-c-1',
  ],
  { cwd: appDir, stdio: ['ignore', 'ignore', 'inherit'] },
);

try {
  await waitForUrl(baseUrl, 120);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(baseUrl, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForSelector('#smoke-root', {
    state: 'attached',
    timeout: 60_000,
  });
  const boundaryErrors = await page.evaluate(
    `(() => window.__smokeRenderErrors || [])()`,
  );
  if (boundaryErrors.length) {
    throw new Error(`component render errors: ${boundaryErrors.join('; ')}`);
  }
  await page.locator('#dark-toggle').click();
  await page.waitForFunction(
    `document.querySelector('#smoke-root')?.classList.contains('dark')`,
    { timeout: 60_000 },
  );
  await page.locator('#probe-toggle').click();
  await page.evaluate(`window.dispatchEvent(new Event('smoke-open-backdrops'))`);
  await page.waitForSelector('#backdrop-probe', { state: 'attached', timeout: 60_000 });
  await assertOpenBackdropsTranslucent(page);
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