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

function parseComponentMeta(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const selectorMatch = src.match(/selector:\s*['"]([^'"]+)['"]/);
  const classMatch = src.match(/export class (\w+)/);
  if (!selectorMatch || !classMatch) return null;
  const base = basename(filePath, '.component.ts');
  return {
    selector: selectorMatch[1],
    className: classMatch[1],
    importBase: base,
    importPath: `../capacitor/angular/components/${base}.component`,
    alias:
      classMatch[1] === 'AppComponent' ? 'CapacitorAppComponent' : classMatch[1],
  };
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
const angularPublic = join(publicRoot, 'angular');
const work = mkdtempSync(join(tmpdir(), 'tc-angular-full-'));
const appDir = join(work, 'full-app');
const registryEnv = { ...process.env, REGISTRY_ROOT: publicRoot };

const scaffold = spawnSync(
  'npx',
  [
    '-y',
    '@angular/cli@19',
    'new',
    'full-app',
    '--defaults',
    '--standalone',
    '--routing=false',
    '--style=css',
    '--ssr=false',
    '--skip-git',
    '--package-manager=npm',
  ],
  { cwd: work, stdio: 'inherit' },
);
if (scaffold.status !== 0) process.exit(scaffold.status ?? 1);

cpSync(join(repoRoot, 'jsconfig.json'), join(appDir, 'jsconfig.json'));
cpSync(join(repoRoot, 'components-angular.json'), join(appDir, 'components.json'));

const tsconfigApp = join(appDir, 'tsconfig.json');
const tsconfig = readJsonc(tsconfigApp);
tsconfig.compilerOptions = tsconfig.compilerOptions || {};
tsconfig.compilerOptions.paths = { '@/*': ['src/*'] };
tsconfig.compilerOptions.baseUrl = './';
writeFileSync(tsconfigApp, `${JSON.stringify(tsconfig, null, 2)}\n`);
const tsconfigAppFile = join(appDir, 'tsconfig.app.json');
if (existsSync(tsconfigAppFile)) {
  const appTs = readJsonc(tsconfigAppFile);
  appTs.compilerOptions = appTs.compilerOptions || {};
  appTs.compilerOptions.paths = { '@/*': ['src/*'] };
  appTs.compilerOptions.baseUrl = './';
  writeFileSync(tsconfigAppFile, `${JSON.stringify(appTs, null, 2)}\n`);
}

const rootItems = [
  join(publicRoot, 'capacitor-tailwind.json'),
  join(publicRoot, 'capacitor-shared.json'),
];
const angularItems = readdirSync(angularPublic)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .sort((a, b) => {
    const d = installOrderPriority(a) - installOrderPriority(b);
    return d !== 0 ? d : a.localeCompare(b);
  })
  .map((name) => join(angularPublic, name));

const installItems = [...rootItems, ...angularItems];

for (const item of installItems) {
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

const componentsDir = join(appDir, 'src/capacitor/angular/components');
const metas = readdirSync(componentsDir)
  .filter(
    (name) =>
      name.endsWith('.component.ts') &&
      statSync(join(componentsDir, name)).isFile(),
  )
  .map((name) => parseComponentMeta(join(componentsDir, name)))
  .filter(Boolean);

const providerImport = `import { TailwindCapacitorProviderComponent } from '../capacitor/angular/shared/tailwind-capacitor-provider.component';`;
const componentImports = metas
  .map((m) => {
    if (m.className === 'AppComponent') {
      return `import { AppComponent as ${m.alias} } from '${m.importPath}';`;
    }
    return `import { ${m.className} } from '${m.importPath}';`;
  })
  .join('\n');

const importNames = [
  'TailwindCapacitorProviderComponent',
  ...metas.map((m) => m.alias),
];

const templateTags = metas
  .filter((m) => m.selector !== 'c-button' && m.selector !== 'c-toggle')
  .map((m) => `<${m.selector}></${m.selector}>`)
  .join('\n      ');

const staleHtml = join(appDir, 'src/app/app.component.html');
if (existsSync(staleHtml)) rmSync(staleHtml);

function writeAppComponent({ includeAllTags }) {
  const probeImports = [
    'TailwindCapacitorProviderComponent',
    'ButtonComponent',
    'ToggleComponent',
  ];
  const probeImportLines = `import { TailwindCapacitorProviderComponent } from '../capacitor/angular/shared/tailwind-capacitor-provider.component';
import { ButtonComponent } from '../capacitor/angular/components/Button.component';
import { ToggleComponent } from '../capacitor/angular/components/Toggle.component';`;

  const importsBlock = includeAllTags
    ? `${providerImport}\n${componentImports}`
    : probeImportLines;
  const importsList = includeAllTags ? importNames : probeImports;
  const extraTags = includeAllTags
    ? `
      <div class="hidden" aria-hidden="true">
      ${templateTags}
      </div>`
    : '';

  writeFileSync(
    join(appDir, 'src/app/app.component.ts'),
    `import { ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
${importsBlock}

declare global {
  interface Window {
    __toggleCount?: number;
    __setDark?: (value: boolean) => void;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [${importsList.join(', ')}],
  template: \`
    <tailwind-capacitor-provider [dark]="dark" theme="material" id="tcp">
      <button id="dark-toggle" type="button" (click)="flipDark()">dark</button>
      <c-button id="probe-button">ok</c-button>
      <c-toggle
        id="probe-toggle"
        [checked]="toggleChecked"
        (checkedChange)="onToggle($event)"
      />${extraTags}
    </tailwind-capacitor-provider>
  \`,
})
export class AppComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);
  dark = false;
  toggleChecked = false;
  toggleCount = 0;

  ngOnInit(): void {
    window.__setDark = (value: boolean) => {
      this.zone.run(() => {
        this.dark = value;
        this.appRef.tick();
      });
    };
  }

  flipDark(): void {
    this.zone.run(() => {
      this.dark = !this.dark;
    });
  }

  onToggle(ev: Event): void {
    this.toggleCount += 1;
    window.__toggleCount = this.toggleCount;
    const input = ev.target as HTMLInputElement | null;
    if (input && typeof input.checked === 'boolean') {
      this.toggleChecked = input.checked;
    }
  }
}
`,
  );
}

writeAppComponent({ includeAllTags: true });

const build = spawnSync('npx', ['ng', 'build'], {
  cwd: appDir,
  stdio: 'inherit',
});
if (build.status !== 0) {
  console.error('ng build failed');
  rmSync(work, { recursive: true, force: true });
  process.exit(build.status ?? 1);
}

function resolveBrowserDist(dir) {
  const candidates = [
    join(dir, 'dist/full-app/browser'),
    join(dir, 'dist/full-app'),
  ];
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'index.html'))) return candidate;
  }
  throw new Error('missing ng build browser output');
}

spawnSync('fuser', ['-k', '4321/tcp'], { stdio: 'ignore' });
const port = 4321;
const baseUrl = `http://127.0.0.1:${port}/`;
const distDir = resolveBrowserDist(appDir);
const server = spawn(
  'npx',
  ['--yes', 'http-server@14.1.1', distDir, '-p', String(port), '-a', '127.0.0.1', '-c-1'],
  { stdio: 'pipe' },
);

try {
  await waitForUrl(baseUrl);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });

  const provider = page.locator('tailwind-capacitor-provider#tcp');
  await provider.waitFor({ state: 'attached' });

  const button = page.locator('c-button#probe-button');
  await button.waitFor({ state: 'attached' });

  const lightClass = await button.evaluate((el) => el.className);
  if (/dark:/.test(lightClass)) {
    throw new Error('c-button should not have dark: classes before flip');
  }

  await page.waitForFunction('typeof window.__setDark === "function"');
  await page.evaluate('window.__setDark?.(true)');
  await sleep(500);
  await page.waitForFunction(
    `document.querySelector('tailwind-capacitor-provider#tcp div')?.classList.contains('dark')`,
    undefined,
    { timeout: 60_000 },
  );
  await page.waitForFunction(
    `(() => {
      const wrap = document.querySelector('tailwind-capacitor-provider#tcp div');
      if (!wrap?.classList.contains('dark')) return false;
      const btn = document.querySelector('c-button#probe-button');
      if (!btn) return false;
      return /dark:/.test(document.body.innerHTML);
    })()`,
    undefined,
    { timeout: 60_000 },
  );

  const toggleInput = page.locator('c-toggle#probe-toggle input[role="switch"]');
  await toggleInput.click();
  await page.waitForFunction('window.__toggleCount === 1');
  const ariaChecked = await toggleInput.getAttribute('aria-checked');
  if (ariaChecked !== 'true') {
    throw new Error(`expected aria-checked=true, got ${ariaChecked}`);
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

console.log('test-angular-full: ok');