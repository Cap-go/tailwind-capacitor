import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;
const publicRoot = join(root, 'public/r');
const branch = process.env.REGISTRY_BRANCH || 'main';
const repoBase = `https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/${branch}/public/r`;

function resolveDep(dep, fileDir) {
  if (typeof dep !== 'string' || dep.startsWith('http')) return dep;
  if (dep.startsWith('./') || dep.startsWith('../')) {
    const from = join(fileDir, dep);
    const rel = relative(publicRoot, from).replace(/\\/g, '/');
    return `${repoBase}/${rel}`;
  }
  return dep;
}

function processFile(path) {
  const fileDir = join(path, '..');
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = data.registryDependencies.map((dep) =>
      resolveDep(dep, fileDir),
    );
  }
  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      if (Array.isArray(item.registryDependencies)) {
        item.registryDependencies = item.registryDependencies.map((dep) =>
          resolveDep(dep, fileDir),
        );
      }
    }
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (name.endsWith('.json')) processFile(path);
  }
}

walk(publicRoot);
console.log(`postprocess-registry: base ${repoBase}/ (REGISTRY_BRANCH=${branch})`);
