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
import {
  assertIosOutlineButtonActiveContrast,
  assertIosTonalButtonActivePress,
  assertOpenBackdropsTranslucent,
  assertProgressbarMaterialTrack,
  assertRangeTrackTranslucent,
} from './smoke-backdrop-translucent.mjs';
import {
  angularSmokeStyles,
  angularSmokeStylesNoSource,
} from './smoke-tailwind-styles.mjs';
import { patchRangeClassesForBtf } from './smoke-btf-patch.mjs';

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
const work = mkdtempSync(join(tmpdir(), 'tc-angular-full-'));
const appDir = join(work, 'full-app');
const tgz = packTgz(work);

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

const publicRoot = installPackInApp(appDir, tgz);
const registryEnv = { ...process.env, REGISTRY_ROOT: publicRoot };
const angularPublic = join(publicRoot, 'angular');

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

for (const item of [...rootItems, ...angularItems]) {
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

patchRangeClassesForBtf(appDir);

writeFileSync(
  join(appDir, 'src/styles.css'),
  `${process.env.BTF_NO_SOURCE ? angularSmokeStylesNoSource : angularSmokeStyles}\n`,
);

writeFileSync(
  join(appDir, '.postcssrc.json'),
  `${JSON.stringify({ plugins: { '@tailwindcss/postcss': {} } }, null, 2)}\n`,
);

const tailwindDeps = spawnSync(
  'npm',
  [
    'install',
    '-D',
    'tailwindcss@^4.1.11',
    '@tailwindcss/postcss@^4.1.11',
    'postcss@^8.4.49',
  ],
  { cwd: appDir, stdio: 'inherit' },
);
if (tailwindDeps.status !== 0) {
  rmSync(work, { recursive: true, force: true });
  process.exit(tailwindDeps.status ?? 1);
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
  .filter((m) => m.selector !== 'c-toggle')
  .map((m) => `<${m.selector}></${m.selector}>`)
  .join('\n      ');

const staleHtml = join(appDir, 'src/app/app.component.html');
if (existsSync(staleHtml)) rmSync(staleHtml);

function writeAppComponent({ uncontrolledToggle }) {
  const toggleBlock = uncontrolledToggle
    ? `<c-toggle id="probe-toggle" />`
    : `<c-toggle id="probe-toggle" [checked]="toggleChecked" (checkedChange)="onToggle($event)" />`;

  writeFileSync(
    join(appDir, 'src/app/app.component.ts'),
    `import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { SheetClasses } from '@/capacitor/shared/classes/SheetClasses.js';
import { ActionsClasses } from '@/capacitor/shared/classes/ActionsClasses.js';
${providerImport}
${componentImports}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, ${importNames.join(', ')}],
  template: \`
    <tailwind-capacitor-provider [dark]="dark" theme="material" id="tcp">
      <button id="dark-toggle" type="button" (click)="flipDark()">dark</button>
      <c-button id="probe-button">ok</c-button>
      <c-button id="probe-outline-ios" [ios]="true" [outline]="true">outline</c-button>
      <c-button id="probe-clear-ios" [ios]="true" [clear]="true">clear</c-button>
      <c-button id="probe-tonal-ios" [ios]="true" [tonal]="true">tonal</c-button>
      <c-progressbar id="probe-progressbar-material" [material]="true"></c-progressbar>
      ${toggleBlock}
      <div class="hidden" aria-hidden="true">
      ${templateTags}
      </div>
      <div id="backdrop-probe" *ngIf="backdropProbe">
        <div [class]="sheetBackdropClass" class="backdrop-probe-layer"></div>
        <div [class]="actionsBackdropClass" class="backdrop-probe-layer"></div>
        <div id="opacity-probe">
          <c-range [material]="true" [value]="50" [min]="0" [max]="100"></c-range>
        </div>
      </div>
    </tailwind-capacitor-provider>
  \`,
})
export class AppComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  dark = false;
  toggleChecked = false;
  backdropProbe = false;
  readonly sheetBackdropClass = SheetClasses({}, {}, '').backdrop.common;
  readonly actionsBackdropClass = ActionsClasses({}, '').backdrop.common;

  ngOnInit(): void {
    window.addEventListener('smoke-open-backdrops', () => {
      this.backdropProbe = true;
      this.cdr.detectChanges();
    });
  }

  flipDark(): void {
    this.dark = !this.dark;
    this.cdr.detectChanges();
  }

  onToggle(ev: Event): void {
    const input = ev.target as HTMLInputElement | null;
    if (input && typeof input.checked === 'boolean') {
      this.toggleChecked = input.checked;
    }
    this.cdr.detectChanges();
  }
}
`,
  );
}

writeAppComponent({ uncontrolledToggle: true });

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

async function runBrowserChecks() {
  const port = 46000 + Math.floor(Math.random() * 3000);
  const baseUrl = `http://127.0.0.1:${port}/`;
  const distDir = resolveBrowserDist(appDir);
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
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );

  const errors = [];
  try {
    await waitForUrl(baseUrl);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });

    const provider = page.locator('tailwind-capacitor-provider#tcp');
    await provider.waitFor({ state: 'attached' });

    const darkBefore = await page.evaluate(
      `!!document.querySelector('tailwind-capacitor-provider#tcp div.dark')`,
    );
    if (darkBefore) {
      throw new Error('provider should start without .dark');
    }
    await page.locator('#dark-toggle').click();
    await page.waitForFunction(
      `!!document.querySelector('tailwind-capacitor-provider#tcp div.dark')`,
      { timeout: 60_000 },
    );

    const toggle = page.locator('c-toggle#probe-toggle');
    await toggle.waitFor({ state: 'attached' });
    await toggle.locator('label').click();
    await page.waitForFunction(
      `document.querySelector('c-toggle#probe-toggle input[role="switch"]')?.getAttribute('aria-checked') === 'true'`,
      { timeout: 60_000 },
    );
    const ariaChecked = await toggle
      .locator('input[role="switch"]')
      .getAttribute('aria-checked');
    if (ariaChecked !== 'true') {
      throw new Error(`expected aria-checked=true, got ${ariaChecked}`);
    }
    await page.evaluate(`window.dispatchEvent(new Event('smoke-open-backdrops'))`);
    await page.waitForSelector('#backdrop-probe .backdrop-probe-layer', {
      state: 'attached',
      timeout: 60_000,
    });
    const buttonVariants = await page.evaluate(`(() => {
      const outline = document.querySelector('c-button#probe-outline-ios');
      const clearBtn = document.querySelector('c-button#probe-clear-ios');
      const tonal = document.querySelector('c-button#probe-tonal-ios');
      if (!outline || !clearBtn || !tonal) {
        return { ok: false, reason: 'missing angular button probes' };
      }
      const outlineCls = outline.className || '';
      const clearCls = clearBtn.className || '';
      const tonalCls = tonal.className || '';
      if (!/\\bborder-2\\b/.test(outlineCls)) {
        return { ok: false, reason: 'outline missing border-2: ' + outlineCls };
      }
      if (!/\\bbg-primary\\/15\\b/.test(tonalCls)) {
        return { ok: false, reason: 'tonal missing bg-primary/15: ' + tonalCls };
      }
      if (/\\bborder-2\\b/.test(clearCls)) {
        return { ok: false, reason: 'clear should not inherit outline border: ' + clearCls };
      }
      if (/(?:^|\\s)bg-primary\\/15(?:\\s|$)/.test(clearCls)) {
        return { ok: false, reason: 'clear should not use tonal fill at rest: ' + clearCls };
      }
      return { ok: true };
    })()`);
    if (!buttonVariants.ok) {
      throw new Error(`angular button variant check failed: ${buttonVariants.reason}`);
    }
    await assertIosOutlineButtonActiveContrast(page);
    await assertIosTonalButtonActivePress(page);
    await assertOpenBackdropsTranslucent(page);
    await assertRangeTrackTranslucent(page);
    await assertProgressbarMaterialTrack(page);

    if (errors.length) {
      throw new Error(`console or page errors: ${errors.join('; ')}`);
    }
    await browser.close();
  } finally {
    server.kill('SIGTERM');
    await sleep(2000);
  }
}

try {
  await runBrowserChecks();
  console.log('test-angular-full: ok');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
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
  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}