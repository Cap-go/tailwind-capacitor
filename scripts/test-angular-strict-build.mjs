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

const addScript = join(repoRoot, 'scripts/registry-add.mjs');
const publicRoot = join(repoRoot, 'public/r');
const angularPublic = join(publicRoot, 'angular');
const dir = mkdtempSync(join(tmpdir(), 'tc-angular-strict-'));

mkdirSync(join(dir, 'src'), { recursive: true });
mkdirSync(join(dir, 'angular'), { recursive: true });

cpSync(join(publicRoot, 'capacitor-tailwind.json'), join(dir, 'capacitor-tailwind.json'));
cpSync(join(publicRoot, 'capacitor-shared.json'), join(dir, 'capacitor-shared.json'));
function localizeRegistryFile(path, baseDir) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep !== 'string') return dep;
      let resolved = dep;
      if (dep.startsWith('http')) {
        const name = dep.split('/').pop();
        const frameworkRoot =
          baseDir.endsWith('/angular') || baseDir.endsWith('/react');
        if (
          frameworkRoot &&
          (name === 'capacitor-tailwind.json' ||
            name === 'capacitor-shared.json')
        ) {
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

for (const name of readdirSync(angularPublic)) {
  if (name.endsWith('.json')) {
    cpSync(join(angularPublic, name), join(dir, 'angular', name));
  }
}
for (const name of readdirSync(join(dir, 'angular'))) {
  if (name.endsWith('.json')) {
    localizeRegistryFile(join(dir, 'angular', name), join(dir, 'angular'));
  }
}

writeFileSync(
  join(dir, 'package.json'),
  JSON.stringify(
    {
      name: 'angular-strict-smoke',
      private: true,
      type: 'module',
      dependencies: {
        '@angular/core': '^19.0.0',
        '@angular/common': '^19.0.0',
        rxjs: '^7.8.1',
      },
      devDependencies: {
        typescript: '^5.8.3',
        '@angular/compiler-cli': '^19.0.0',
      },
    },
    null,
    2,
  ),
);

writeFileSync(
  join(dir, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        strict: true,
        experimentalDecorators: true,
        skipLibCheck: true,
        noEmit: true,
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
        },
      },
      include: ['src/**/*.ts'],
    },
    null,
    2,
  ),
);

cpSync(join(repoRoot, 'jsconfig.json'), join(dir, 'jsconfig.json'));
cpSync(join(repoRoot, 'components-angular.json'), join(dir, 'components.json'));

const npmCi = spawnSync('npm', ['install'], { cwd: dir, stdio: 'inherit' });
if (npmCi.status !== 0) process.exit(npmCi.status ?? 1);

const items = readdirSync(join(dir, 'angular'))
  .filter((n) => n.startsWith('capacitor-') && n.endsWith('.json'))
  .map((n) => join(dir, 'angular', n))
  .sort();

for (const item of items) {
  const result = spawnSync('node', [addScript, item], {
    cwd: dir,
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(`registry-add failed: ${item}`);
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(1);
  }
}

const ngc = spawnSync(
  'npx',
  ['tsc', '-p', 'tsconfig.json', '--noEmit'],
  { cwd: dir, stdio: 'inherit' },
);
if (ngc.status !== 0) {
  console.error('angular strict compile failed');
  process.exit(ngc.status ?? 1);
}

rmSync(dir, { recursive: true, force: true });
console.log('test-angular-strict-build: ok');
