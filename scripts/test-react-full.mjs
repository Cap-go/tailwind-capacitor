import {
  cpSync,
  existsSync,
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

function prependNoCheck(rootDir) {
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      const st = statSync(path);
      if (st.isDirectory()) {
        stack.push(path);
        continue;
      }
      if (!/\.(tsx?|jsx?)$/.test(name)) continue;
      const content = readFileSync(path, 'utf8');
      if (!content.startsWith('// @ts-nocheck')) {
        writeFileSync(path, `// @ts-nocheck\n${content}`);
      }
    }
  }
}

function readJsonc(path) {
  const raw = readFileSync(path, 'utf8');
  const stripped = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(stripped);
}

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

function componentExportName(file) {
  return basename(file, '.tsx').replace(/Icon$/, 'Icon');
}

async function waitForUrl(url, attempts = 120) {
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
const work = mkdtempSync(join(tmpdir(), 'tc-react-full-'));
const appDir = join(work, 'react-app');
const tgz = packTgz(work);

const scaffold = spawnSync(
  'npm',
  ['create', 'vite@latest', 'react-app', '--', '--template', 'react-ts'],
  { cwd: work, stdio: 'inherit' },
);
if (scaffold.status !== 0) process.exit(scaffold.status ?? 1);

const npmInstall = spawnSync('npm', ['install'], { cwd: appDir, stdio: 'inherit' });
if (npmInstall.status !== 0) process.exit(npmInstall.status ?? 1);

const publicRoot = installPackInApp(appDir, tgz);
const reactPublic = join(publicRoot, 'react');
const registryEnv = { ...process.env, REGISTRY_ROOT: publicRoot };

cpSync(join(repoRoot, 'components-react.json'), join(appDir, 'components.json'));
cpSync(join(repoRoot, 'jsconfig.json'), join(appDir, 'jsconfig.json'));
writeFileSync(
  join(appDir, 'src/style.css'),
  '@import "@/capacitor/styles/tailwind-capacitor.css";\n',
);

writeFileSync(
  join(appDir, 'vite.config.ts'),
  `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
const reactItems = readdirSync(reactPublic)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .sort((a, b) => {
    const d = installOrderPriority(a) - installOrderPriority(b);
    return d !== 0 ? d : a.localeCompare(b);
  })
  .map((name) => join(reactPublic, name));

for (const item of [...rootItems, ...reactItems]) {
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

const capacitorSrc = join(appDir, 'src/capacitor');
if (existsSync(capacitorSrc)) prependNoCheck(capacitorSrc);

const componentsDir = join(appDir, 'src/capacitor/react/components');
const componentFiles = readdirSync(componentsDir)
  .filter((name) => {
    if (!name.endsWith('.tsx')) return false;
    if (name.endsWith('Context.tsx')) return false;
    if (name === 'App.tsx') return false;
    return statSync(join(componentsDir, name)).isFile();
  })
  .sort();

if (!componentFiles.length) {
  console.error('no react components installed');
  process.exit(1);
}

const imports = componentFiles
  .map(
    (f) =>
      `import ${componentExportName(f)} from '@/capacitor/react/components/${f.replace(/\.tsx$/, '')}';`,
  )
  .join('\n');

const tags = componentFiles
  .map((f) => {
    const name = componentExportName(f);
    if (name === 'Button') return '<Button id="probe-button">ok</Button>';
    if (name === 'Toggle') return '<Toggle />';
    return `<${name} />`;
  })
  .join('\n        ');

writeFileSync(
  join(appDir, 'src/App.tsx'),
  `import { useState } from 'react';
import { TailwindCapacitorProvider } from '@/capacitor/react/shared/TailwindCapacitorProvider';
${imports}

export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <div id="smoke-root" className={dark ? 'dark' : ''}>
      <button id="dark-toggle" type="button" onClick={() => setDark((v) => !v)}>
        dark
      </button>
      <TailwindCapacitorProvider theme="ios" dark={dark}>
        ${tags}
      </TailwindCapacitorProvider>
    </div>
  );
}
`,
);

writeFileSync(
  join(appDir, 'src/main.tsx'),
  `import { createRoot } from 'react-dom/client';
import './style.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
`,
);

const tsconfig = readJsonc(join(appDir, 'tsconfig.app.json'));
tsconfig.compilerOptions = tsconfig.compilerOptions || {};
tsconfig.compilerOptions.paths = { '@/*': ['./src/*'] };
delete tsconfig.compilerOptions.baseUrl;
Object.assign(tsconfig.compilerOptions, {
  strict: false,
  noImplicitAny: false,
  skipLibCheck: true,
});
writeFileSync(join(appDir, 'tsconfig.app.json'), `${JSON.stringify(tsconfig, null, 2)}\n`);

const viteBuild = spawnSync('npx', ['vite', 'build'], { cwd: appDir, stdio: 'inherit' });
if (viteBuild.status !== 0) {
  rmSync(work, { recursive: true, force: true });
  process.exit(viteBuild.status ?? 1);
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
  await waitForUrl(baseUrl);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (err) => runtimeErrors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') runtimeErrors.push(msg.text());
  });
  await page.goto(baseUrl, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForSelector('#smoke-root', { state: 'attached', timeout: 60_000 });
  await page.locator('#dark-toggle').click();
  await page.waitForFunction(
    `document.querySelector('#smoke-root')?.classList.contains('dark')`,
    { timeout: 60_000 },
  );
  if (runtimeErrors.length) {
    const body = await page.locator('#root').innerHTML().catch(() => '');
    throw new Error(`runtime errors: ${runtimeErrors.join('; ')} | root: ${body.slice(0, 500)}`);
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

console.log('test-react-full: ok');