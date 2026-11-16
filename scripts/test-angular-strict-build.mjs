import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './repo-root.mjs';

function readJsonc(path) {
  const raw = readFileSync(path, 'utf8');
  const stripped = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(stripped);
}

const addScript = join(repoRoot, 'scripts/registry-add.mjs');
const publicRoot = join(repoRoot, 'public/r');
const angularPublic = join(publicRoot, 'angular');
const work = mkdtempSync(join(tmpdir(), 'tc-angular-ngc-'));
const appDir = join(work, 'strict-app');

function localizeRegistryFile(path, baseDir) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep !== 'string') return dep;
      let resolved = dep;
      if (dep.startsWith('http')) {
        const name = dep.split('/').pop();
        if (name === 'capacitor-tailwind.json' || name === 'capacitor-shared.json') {
          resolved = join(dirname(baseDir), name);
        } else {
          resolved = join(baseDir, name);
        }
      } else if (dep.startsWith('./') || dep.startsWith('../')) {
        resolved = join(baseDir, dep);
      }
      let rel = relative(baseDir, resolved).replaceAll('\\', '/');
      if (!rel.startsWith('.')) rel = `./${rel}`;
      return rel;
    });
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = toLocal(data.registryDependencies);
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

const scaffold = spawnSync(
  'npx',
  [
    '-y',
    '@angular/cli@19',
    'new',
    'strict-app',
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

mkdirSync(join(appDir, 'angular'), { recursive: true });
cpSync(join(publicRoot, 'capacitor-tailwind.json'), join(appDir, 'capacitor-tailwind.json'));
cpSync(join(publicRoot, 'capacitor-shared.json'), join(appDir, 'capacitor-shared.json'));
for (const name of readdirSync(angularPublic)) {
  if (name.endsWith('.json')) {
    cpSync(join(angularPublic, name), join(appDir, 'angular', name));
  }
}
for (const name of readdirSync(join(appDir, 'angular'))) {
  if (name.endsWith('.json')) {
    localizeRegistryFile(join(appDir, 'angular', name), join(appDir, 'angular'));
  }
}

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

const installCommands = [
  join(appDir, 'capacitor-tailwind.json'),
  join(appDir, 'capacitor-shared.json'),
  join(appDir, 'angular/capacitor-provider.json'),
  join(appDir, 'angular/capacitor-button.json'),
  join(appDir, 'angular/capacitor-toggle.json'),
  join(appDir, 'angular/capacitor-checkbox.json'),
  join(appDir, 'angular/capacitor-radio.json'),
  join(appDir, 'angular/capacitor-range.json'),
  join(appDir, 'angular/capacitor-searchbar.json'),
  join(appDir, 'angular/capacitor-list-input.json'),
  join(appDir, 'angular/capacitor-select.json'),
];

for (const item of installCommands) {
  const result = spawnSync(
    'node',
    [addScript, item],
    {
      cwd: appDir,
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, REGISTRY_ROOT: publicRoot },
    },
  );
  if (result.status !== 0) {
    console.error(`registry-add failed: ${item}`);
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(1);
  }
}

writeFileSync(
  join(appDir, 'src/app/app.component.ts'),
  `import { Component } from '@angular/core';
import { TailwindCapacitorProviderComponent } from '../capacitor/angular/shared/tailwind-capacitor-provider.component';
import { ButtonComponent } from '../capacitor/angular/components/Button.component';
import { ToggleComponent } from '../capacitor/angular/components/Toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TailwindCapacitorProviderComponent, ButtonComponent, ToggleComponent],
  template: \`
    <tailwind-capacitor-provider [dark]="false">
      <c-button>ok</c-button>
      <c-toggle [checked]="true" />
    </tailwind-capacitor-provider>
  \`,
})
export class AppComponent {}
`,
);

const build = spawnSync('npx', ['ng', 'build'], {
  cwd: appDir,
  stdio: 'inherit',
});
if (build.status !== 0) {
  console.error('ng build failed');
  process.exit(build.status ?? 1);
}

rmSync(work, { recursive: true, force: true });
console.log('test-angular-strict-build: ok');
