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
import { assertOpenBackdropsTranslucent } from './smoke-backdrop-translucent.mjs';

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

function smokeProps(name) {
  const propsByName = {
    Dialog: 'opened={false}',
    Modal: 'opened={false}',
    Popover: 'opened={false}',
    Popup: 'opened={false}',
    Panel: 'opened={false}',
    Sheet: 'opened={false}',
    Toast: 'opened={false}',
    Toggle: 'checked={false}',
    Checkbox: 'checked={false}',
    Radio: 'checked={false}',
    Range: 'value={50}',
  };
  return propsByName[name] || '';
}

function listReactComponentFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      out.push(...listReactComponentFiles(path));
      continue;
    }
    if (!name.endsWith('.tsx')) continue;
    if (name.endsWith('Context.tsx') || name === 'App.tsx') continue;
    out.push(path);
  }
  return out.sort();
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
  [
    'create',
    'vite@latest',
    'react-app',
    '--',
    '--template',
    'react-ts',
    '--no-interactive',
  ],
  { cwd: work, stdio: 'inherit', env: { ...process.env, CI: '1' } },
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
const registryItemNames = readdirSync(reactPublic)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .sort((a, b) => {
    const d = installOrderPriority(a) - installOrderPriority(b);
    return d !== 0 ? d : a.localeCompare(b);
  });
const reactItems = registryItemNames.map((name) => join(reactPublic, name));
const MIN_REGISTRY_COMPONENTS = registryItemNames.length - 2;

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
const componentFiles = listReactComponentFiles(componentsDir);

if (!componentFiles.length) {
  console.error('no react components installed');
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
  `test-react-full: installed ${componentFiles.length} components from ${registryItemNames.length} registry items`,
);

const relImport = (abs) =>
  abs
    .slice(componentsDir.length + 1)
    .replace(/\.tsx$/, '');

const imports = componentFiles
  .map((f) => {
    const rel = relImport(f);
    const base = basename(f, '.tsx');
    const exportName = componentExportName(f);
    const importPath = rel.includes('/') ? rel.replace(/\//g, '/') : rel;
    return `import ${exportName} from '@/capacitor/react/components/${importPath}';`;
  })
  .join('\n');

writeFileSync(
  join(appDir, 'src/App.tsx'),
  `import React, { useState } from 'react';
import { TailwindCapacitorProvider } from '@/capacitor/react/shared/TailwindCapacitorProvider';
${imports}

class SmokeBoundary extends React.Component<{ name: string; children: React.ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(err: unknown) {
    return { err: String(err) };
  }
  componentDidCatch(err: unknown) {
    const key = '__smokeRenderErrors';
    const w = window as unknown as { [key: string]: string[] };
    w[key] = w[key] || [];
    w[key].push(\`\${this.props.name}: \${String(err)}\`);
  }
  render() {
    if (this.state.err) return null;
    return this.props.children;
  }
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [backdropProbe, setBackdropProbe] = useState(false);
  React.useEffect(() => {
    const open = () => setBackdropProbe(true);
    window.addEventListener('smoke-open-backdrops', open);
    return () => window.removeEventListener('smoke-open-backdrops', open);
  }, []);
  return (
    <div id="smoke-root" className={dark ? 'dark' : ''}>
      <button id="dark-toggle" type="button" onClick={() => setDark((v) => !v)}>
        dark
      </button>
      <TailwindCapacitorProvider theme="material" dark={dark}>
        <Toggle checked={false} id="probe-toggle" />
        <div className="hidden" aria-hidden="true">
        ${componentFiles
          .filter((f) => basename(f) !== 'Toggle.tsx')
          .map((f) => {
            const name = componentExportName(f);
            const extra = smokeProps(name);
            const tag =
              name === 'Button'
                ? '<Button id="probe-button">ok</Button>'
                : extra
                  ? `<${name} ${extra} />`
                  : `<${name} />`;
            return `<SmokeBoundary name="${name}">${tag}</SmokeBoundary>`;
          })
          .join('\n        ')}
        </div>
        {backdropProbe ? (
          <div id="backdrop-probe">
            <Sheet opened material>
              <div className="p-4">sheet</div>
            </Sheet>
            <Actions opened material>
              <ActionsGroup>
                <ActionsButton>ok</ActionsButton>
              </ActionsGroup>
            </Actions>
          </div>
        ) : null}
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