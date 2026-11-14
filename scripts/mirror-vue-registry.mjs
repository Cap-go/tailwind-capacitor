import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;
const src = join(root, 'public/r');
const dest = join(root, 'public/r/vue');
mkdirSync(dest, { recursive: true });

for (const name of readdirSync(src)) {
  if (!name.startsWith('capacitor-') || !name.endsWith('.json')) continue;
  cpSync(join(src, name), join(dest, name));
}
if (readdirSync(src).includes('registry.json')) {
  cpSync(join(src, 'registry.json'), join(dest, 'registry.json'));
}
console.log('mirror-vue-registry: public/r/vue updated');
