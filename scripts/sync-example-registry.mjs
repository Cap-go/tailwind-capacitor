import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;
const registryDir = join(root, 'public/r');
const exampleDir = join(root, 'example');

const items = readdirSync(registryDir)
  .filter((name) => name.endsWith('.json') && name !== 'registry.json')
  .sort();

for (const item of items) {
  const result = spawnSync(
    'node',
    [join(root, 'scripts/registry-add.mjs'), join(registryDir, item)],
    {
      cwd: exampleDir,
      stdio: 'inherit',
      env: { ...process.env, REGISTRY_ROOT: registryDir },
    },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`synced ${items.length} registry items into example/`);
