import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const dir = join(root, 'public/r');

const branch =
  process.env.REGISTRY_BRANCH ||
  spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).stdout.trim() ||
  'main';

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

console.log(`postprocess-registry: base ${base}/`);
