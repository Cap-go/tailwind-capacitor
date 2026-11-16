import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Swap v4 slash track utilities to legacy v3 tokens for negative testing. */
export function patchRangeClassesForBtf(appDir) {
  if (process.env.BTF_LEGACY_RANGE !== '1') return;
  const path = join(appDir, 'src/capacitor/shared/classes/RangeClasses.js');
  if (!existsSync(path)) {
    throw new Error(`BTF_LEGACY_RANGE: missing ${path}`);
  }
  const src = readFileSync(path, 'utf8');
  const patched = src
    .replaceAll('bg-black/20', 'bg-black bg-opacity-20')
    .replaceAll('dark:bg-white/20', 'dark:bg-white dark:bg-opacity-20');
  writeFileSync(path, patched);
}