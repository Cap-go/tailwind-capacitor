import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './repo-root.mjs';

const registryDir = join(repoRoot, 'public/r');
const dir = mkdtempSync(join(tmpdir(), 'tc-registry-'));

function localizeRegistryFile(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep === 'string' && dep.startsWith('http')) {
        return `./${dep.split('/').pop()}`;
      }
      return dep;
    });
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = toLocal(data.registryDependencies);
  }
  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      if (Array.isArray(item.registryDependencies)) {
        item.registryDependencies = toLocal(item.registryDependencies);
      }
    }
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

for (const name of readdirSync(registryDir)) {
  if (name.endsWith('.json')) {
    const dest = join(dir, name);
    cpSync(join(registryDir, name), dest);
    localizeRegistryFile(dest);
  }
}

writeFileSync(
  join(dir, 'package.json'),
  JSON.stringify({ name: 'registry-install-smoke', private: true, type: 'module' }, null, 2),
);
mkdirSync(join(dir, 'src'), { recursive: true });
writeFileSync(join(dir, 'src/style.css'), '@import "tailwindcss";\n');
cpSync(join(repoRoot, 'components.json'), join(dir, 'components.json'));
cpSync(join(repoRoot, 'jsconfig.json'), join(dir, 'jsconfig.json'));

const items = readdirSync(dir)
  .filter(
    (name) =>
      name.endsWith('.json') &&
      name !== 'registry.json' &&
      name !== 'components.json',
  )
  .sort();

for (const item of items) {
  const result = spawnSync(
    'node',
    [join(repoRoot, 'scripts/registry-add.mjs'), join(dir, item)],
    { cwd: dir, stdio: 'inherit', env: { ...process.env, REGISTRY_ROOT: registryDir } },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const parsed = JSON.parse(readFileSync(join(dir, item), 'utf8'));
  for (const file of parsed.files || []) {
    const target = join(dir, file.target);
    if (!readFileSync(target, 'utf8')) {
      console.error(`empty file after install: ${file.target}`);
      process.exit(1);
    }
  }
}

const buttonPath = join(dir, 'src/capacitor/vue/components/Button.vue');
if (!readFileSync(buttonPath, 'utf8').includes('c-button')) {
  console.error('missing Button.vue after registry install');
  process.exit(1);
}

const stylePath = join(dir, 'src/capacitor/styles/variants.css');
if (!readFileSync(stylePath, 'utf8').includes('@custom-variant ios')) {
  console.error('missing tailwind-capacitor.css after registry install');
  process.exit(1);
}

const shadcn = spawnSync(
  'npx',
  ['shadcn@3.2.1', 'add', join(dir, 'capacitor-button.json'), '-y'],
  { cwd: dir, stdio: 'pipe', encoding: 'utf8' },
);
if (shadcn.status !== 0) {
  console.error(shadcn.stdout);
  console.error(shadcn.stderr);
  process.exit(1);
}

rmSync(dir, { recursive: true, force: true });
console.log(`test-registry-install: ok (${items.length} items)`);
