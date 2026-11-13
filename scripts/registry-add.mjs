import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const scriptRoot = new URL('..', import.meta.url).pathname;
const defaultRegistryDir = join(scriptRoot, 'public/r');
const registryRoot = process.env.REGISTRY_ROOT || defaultRegistryDir;
const itemPath = resolve(process.argv[2] || '');

if (!itemPath || !existsSync(itemPath)) {
  console.error('usage: node scripts/registry-add.mjs <registry-item.json>');
  process.exit(1);
}

const installed = new Set();

function loadItem(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function resolveDep(dep, baseDir) {
  if (dep.startsWith('http://') || dep.startsWith('https://')) {
    const name = dep.split('/').pop() || dep;
    return join(registryRoot, name);
  }
  if (dep.startsWith('./')) {
    return join(baseDir, dep);
  }
  return join(baseDir, `${dep}.json`);
}

function installItem(path) {
  const abs = resolve(path);
  if (installed.has(abs)) return;
  const item = loadItem(abs);
  installed.add(abs);
  const baseDir = dirname(abs);

  if (Array.isArray(item.registryDependencies)) {
    for (const dep of item.registryDependencies) {
      installItem(resolveDep(dep, baseDir));
    }
  }

  for (const file of item.files || []) {
    if (!file.target) {
      throw new Error(`missing target for ${file.path}`);
    }
    const target = join(root, file.target);
    mkdirSync(dirname(target), { recursive: true });
    if (typeof file.content !== 'string') {
      throw new Error(`missing built content for ${file.path}`);
    }
    writeFileSync(target, file.content);
  }

  const deps = [
    ...asArray(item.dependencies),
    ...asArray(item.devDependencies),
  ];
  if (deps.length) {
    spawnSync('npm', ['install', ...new Set(deps)], {
      cwd: root,
      stdio: 'pipe',
    });
  }
}

installItem(itemPath);
console.log(`registry-add: ok (${installed.size} items)`);

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}
