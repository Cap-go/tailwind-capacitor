#!/usr/bin/env node
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const installed = new Set();
const registryRoot = process.env.REGISTRY_ROOT
  ? resolve(process.env.REGISTRY_ROOT)
  : null;

function loadItem(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function publicRelFromUrl(url) {
  const marker = '/public/r/';
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i + marker.length).split('?')[0];
}

function mapUrlToLocal(url) {
  if (!registryRoot) return null;
  const rel = publicRelFromUrl(url);
  if (!rel) return null;
  const direct = join(registryRoot, rel);
  if (existsSync(direct)) return resolve(direct);
  const name = rel.split('/').pop();
  if (!name) return null;
  if (rel.includes('/angular/')) {
    const p = join(registryRoot, 'angular', name);
    return existsSync(p) ? resolve(p) : null;
  }
  if (rel.includes('/react/')) {
    const p = join(registryRoot, 'react', name);
    return existsSync(p) ? resolve(p) : null;
  }
  if (rel.includes('/vue/')) {
    const p = join(registryRoot, 'vue', name);
    return existsSync(p) ? resolve(p) : null;
  }
  const atRoot = join(registryRoot, name);
  if (existsSync(atRoot)) return resolve(atRoot);
  return null;
}

function cachePathForUrl(url) {
  const local = mapUrlToLocal(url);
  if (local) return local;
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 32);
  const name = url.split('/').pop()?.split('?')[0] || 'item.json';
  const cacheDir = join(tmpdir(), 'capgo-tailwind-registry-cache');
  mkdirSync(cacheDir, { recursive: true });
  return join(cacheDir, `${hash}-${name}`);
}

async function materializeItemPath(arg) {
  if (!arg) return null;
  if (arg.startsWith('http://') || arg.startsWith('https://')) {
    const target = cachePathForUrl(arg);
    const force = process.env.REGISTRY_FORCE_FETCH === '1';
    if (!existsSync(target) || force) {
      const res = await fetch(arg);
      if (!res.ok) {
        throw new Error(`fetch failed (${res.status}): ${arg}`);
      }
      writeFileSync(target, await res.text());
    }
    return resolve(target);
  }
  const abs = resolve(arg);
  if (!existsSync(abs)) return null;
  return abs;
}

function resolveDep(dep, baseDir) {
  if (isAbsolute(dep)) {
    return dep;
  }
  if (dep.startsWith('http://') || dep.startsWith('https://')) {
    const local = mapUrlToLocal(dep);
    if (local) return local;
    return cachePathForUrl(dep);
  }
  if (dep.startsWith('./') || dep.startsWith('../')) {
    return resolve(baseDir, dep);
  }
  if (dep.endsWith('.json')) {
    return join(baseDir, dep);
  }
  return join(baseDir, `${dep}.json`);
}

async function ensureRegistryDependency(dep) {
  const local = mapUrlToLocal(dep);
  if (local && existsSync(local)) return local;
  const target = cachePathForUrl(dep);
  const force = process.env.REGISTRY_FORCE_FETCH === '1';
  if (!existsSync(target) || force) {
    const res = await fetch(dep);
    if (!res.ok) {
      throw new Error(`fetch failed (${res.status}): ${dep}`);
    }
    writeFileSync(target, await res.text());
  }
  return target;
}

async function installItem(path) {
  const abs = resolve(path);
  if (installed.has(abs)) return;
  const item = loadItem(abs);
  installed.add(abs);
  const baseDir = dirname(abs);

  if (Array.isArray(item.registryDependencies)) {
    for (const dep of item.registryDependencies) {
      if (typeof dep === 'string' && dep.startsWith('http')) {
        const fetched = await ensureRegistryDependency(dep);
        await installItem(fetched);
        continue;
      }
      await installItem(resolveDep(dep, baseDir));
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
    const install = spawnSync('npm', ['install', ...new Set(deps)], {
      cwd: root,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    if (install.status !== 0) {
      console.error(install.stdout);
      console.error(install.stderr);
      throw new Error(`npm install failed for ${item.name || path}`);
    }
  }
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string');
  }
  if (typeof value === 'string') return [value];
  return [];
}

async function prefetchItemGraph(itemPath) {
  const item = loadItem(itemPath);
  const baseDir = dirname(itemPath);
  if (!Array.isArray(item.registryDependencies)) return;
  for (const dep of item.registryDependencies) {
    if (typeof dep === 'string' && dep.startsWith('http')) {
      const resolved = await ensureRegistryDependency(dep);
      await prefetchItemGraph(resolved);
    } else if (typeof dep === 'string') {
      const resolved = resolveDep(dep, baseDir);
      if (existsSync(resolved)) {
        await prefetchItemGraph(resolved);
      }
    }
  }
}

let argv = process.argv.slice(2);
if (argv[0] === 'registry-add') {
  argv = argv.slice(1);
}
const itemArg = argv[0];

if (!itemArg) {
  console.error(
    'usage: node scripts/registry-add.mjs <registry-item.json|url>',
  );
  console.error(
    'or: npx @capgo/tailwind-capacitor registry-add <registry-item.json|url>',
  );
  process.exit(1);
}

const itemPath = await materializeItemPath(itemArg);
if (!itemPath) {
  console.error(`registry item not found: ${itemArg}`);
  process.exit(1);
}

try {
  await prefetchItemGraph(itemPath);
  await installItem(itemPath);
  console.log(`registry-add: ok (${installed.size} items)`);
} finally {
  const legacyCache = join(root, '.registry-cache');
  if (existsSync(legacyCache)) {
    rmSync(legacyCache, { recursive: true, force: true });
  }
}
