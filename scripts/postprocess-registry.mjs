import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;
const dir = join(root, 'public/r');

function registryBranch() {
  if (process.env.REGISTRY_BRANCH) {
    return process.env.REGISTRY_BRANCH;
  }
  const head = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  });
  const branch = head.stdout.trim();
  if (branch && branch !== 'HEAD') return branch;
  return 'main';
}

const branch = registryBranch();

const base = `https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/${branch}/public/r`;

for (const file of readdirSync(dir)) {
  if (!file.endsWith('.json')) continue;
  const path = join(dir, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = data.registryDependencies.map((dep) => {
      if (dep.startsWith('./')) {
        return `${base}/${dep.slice(2)}`;
      }
      return dep;
    });
  }
  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      if (Array.isArray(item.registryDependencies)) {
        item.registryDependencies = item.registryDependencies.map((dep) => {
          if (typeof dep === 'string' && dep.startsWith('./')) {
            return `${base}/${dep.slice(2)}`;
          }
          return dep;
        });
      }
    }
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`postprocess-registry: base ${base}/ (branch ${branch})`);
