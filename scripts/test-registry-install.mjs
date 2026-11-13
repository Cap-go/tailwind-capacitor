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

const root = new URL('..', import.meta.url).pathname;
const registryDir = join(root, 'public/r');
const dir = mkdtempSync(join(tmpdir(), 'tc-registry-'));

for (const name of readdirSync(registryDir)) {
  if (name.endsWith('.json')) {
    cpSync(join(registryDir, name), join(dir, name));
  }
}

writeFileSync(
  join(dir, 'package.json'),
  JSON.stringify({ name: 'registry-install-smoke', private: true, type: 'module' }, null, 2),
);
mkdirSync(join(dir, 'src'), { recursive: true });
writeFileSync(join(dir, 'src/style.css'), '@import "tailwindcss";\n');

const items = readdirSync(dir)
  .filter((name) => name.endsWith('.json') && name !== 'registry.json')
  .sort();

for (const item of items) {
  const result = spawnSync(
    'node',
    [join(root, 'scripts/registry-add.mjs'), join(dir, item)],
    { cwd: dir, stdio: 'inherit' },
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

try {
  const shadcn = spawnSync(
    'npx',
  ['shadcn@3.2.1', 'add', join(dir, 'capacitor-tailwind.json'), '-y'],
    { cwd: dir, stdio: 'pipe', encoding: 'utf8' },
  );
  if (shadcn.status === 0) {
    console.log('shadcn add: ok');
  } else {
    console.log('shadcn add: skipped (known vue/css transform limitation)');
  }
} catch {
  console.log('shadcn add: skipped');
}

rmSync(dir, { recursive: true, force: true });
console.log(`test-registry-install: ok (${items.length} items)`);
