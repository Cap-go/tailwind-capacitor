import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './repo-root.mjs';

const packDir = mkdtempSync(join(tmpdir(), 'tc-pack-'));
const pack = spawnSync('npm', ['pack', '--pack-destination', packDir], {
  cwd: repoRoot,
  stdio: 'pipe',
  encoding: 'utf8',
});
if (pack.status !== 0) {
  console.error(pack.stderr);
  process.exit(pack.status ?? 1);
}

const packLine = pack.stdout
  .trim()
  .split('\n')
  .find((line) => line.endsWith('.tgz'));
if (!packLine) {
  console.error('npm pack did not output a tgz path');
  process.exit(1);
}
const tgzPath = join(packDir, packLine.trim());

function assertButtonInstalled(projectDir, label) {
  const target = join(
    projectDir,
    'src/capacitor/angular/components/Button.component.ts',
  );
  if (!existsSync(target) || !readFileSync(target, 'utf8').trim()) {
    console.error(`${label}: missing Button.component.ts`);
    process.exit(1);
  }
}

function runNodeRegistryAdd(projectDir, pkgRoot, buttonJson) {
  const addScript = join(pkgRoot, 'scripts/registry-add.mjs');
  const registryRoot = join(pkgRoot, 'public/r');
  const result = spawnSync('node', [addScript, buttonJson], {
    cwd: projectDir,
    stdio: 'pipe',
    encoding: 'utf8',
    env: { ...process.env, REGISTRY_ROOT: registryRoot },
  });
  if (result.status !== 0) {
    console.error('node registry-add failed');
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(1);
  }
}

const work = mkdtempSync(join(tmpdir(), 'tc-readme-install-'));
const projectA = join(work, 'proj-node');
mkdirSync(projectA, { recursive: true });
writeFileSync(
  join(projectA, 'package.json'),
  JSON.stringify(
    {
      name: 'readme-install-node',
      private: true,
      type: 'module',
      dependencies: {
        '@angular/core': '^19.0.0',
        '@angular/common': '^19.0.0',
      },
    },
    null,
    2,
  ),
);

const installA = spawnSync('npm', ['install', tgzPath], {
  cwd: projectA,
  stdio: 'inherit',
});
if (installA.status !== 0) process.exit(installA.status ?? 1);

const pkgRootA = join(projectA, 'node_modules/@capgo/tailwind-capacitor');
const buttonJsonA = join(pkgRootA, 'public/r/angular/capacitor-button.json');
runNodeRegistryAdd(projectA, pkgRootA, buttonJsonA);
assertButtonInstalled(projectA, 'node registry-add');

const projectB = join(work, 'proj-npx');
mkdirSync(projectB, { recursive: true });
writeFileSync(
  join(projectB, 'package.json'),
  JSON.stringify(
    {
      name: 'readme-install-npx',
      private: true,
      type: 'module',
      dependencies: {
        '@angular/core': '^19.0.0',
        '@angular/common': '^19.0.0',
      },
    },
    null,
    2,
  ),
);

const installB = spawnSync('npm', ['install', tgzPath], {
  cwd: projectB,
  stdio: 'inherit',
});
if (installB.status !== 0) process.exit(installB.status ?? 1);

const pkgRootB = join(projectB, 'node_modules/@capgo/tailwind-capacitor');
const buttonJsonB = join(pkgRootB, 'public/r/angular/capacitor-button.json');
const npxResult = spawnSync(
  'npx',
  ['--yes', '--package', tgzPath, 'registry-add', buttonJsonB],
  {
    cwd: projectB,
    stdio: 'pipe',
    encoding: 'utf8',
    env: {
      ...process.env,
      REGISTRY_ROOT: join(pkgRootB, 'public/r'),
    },
  },
);
if (npxResult.status !== 0) {
  console.error('npx registry-add failed');
  console.error(npxResult.stdout);
  console.error(npxResult.stderr);
  process.exit(1);
}
assertButtonInstalled(projectB, 'npx registry-add');

rmSync(work, { recursive: true, force: true });
rmSync(packDir, { recursive: true, force: true });
console.log('test-readme-install: ok');