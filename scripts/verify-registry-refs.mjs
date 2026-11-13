import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const dir = join(repoRoot, 'public/r');
const allowed = '/refs/heads/main/';
const violations = [];

for (const file of readdirSync(dir)) {
  if (!file.endsWith('.json')) continue;
  const text = readFileSync(join(dir, file), 'utf8');
  const matches = text.matchAll(/refs\/heads\/[^/"'\s]+/g);
  for (const match of matches) {
    const ref = match[0];
    if (ref !== 'refs/heads/main') {
      violations.push(`${file}: ${ref}`);
    }
  }
}

if (violations.length) {
  console.error('registry URLs must use refs/heads/main in committed public/r:');
  for (const line of violations) {
    console.error(`  ${line}`);
  }
  console.error(
    'Rebuild with default postprocess (REGISTRY_BRANCH=main). For a local branch preview only, set REGISTRY_BRANCH and do not commit public/r.',
  );
  process.exit(1);
}

console.log('verify-registry-refs: ok');
