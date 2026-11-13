import { cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;
const outDir = join(root, 'registry/capacitor/config');
mkdirSync(outDir, { recursive: true });

const files = [
  'plugin-base.js',
  'plugin-colors.js',
  'hex-to-rgb.js',
  'ios-colors.js',
  'md-colors.js',
  'join-safe-class-selector.js',
];

for (const file of files) {
  const src = join(root, 'src/config', file);
  const dest = join(outDir, file);
  cpSync(src, dest);
  const parent = dirname(dest);
  mkdirSync(parent, { recursive: true });
  cpSync(src, dest);
}
console.log(`copied ${files.length} config files to registry/capacitor/config/`);
