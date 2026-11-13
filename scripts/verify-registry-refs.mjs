import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

function collectViolations(text, label) {
  const found = [];
  const matches = text.matchAll(/refs\/heads\/[^/"'\s]+/g);
  for (const match of matches) {
    if (match[0] !== 'refs/heads/main') {
      found.push(`${label}: ${match[0]}`);
    }
  }
  return found;
}

const violations = [];

const dir = join(repoRoot, 'public/r');
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.json')) continue;
  violations.push(...collectViolations(readFileSync(join(dir, file), 'utf8'), file));
}

const rootRegistry = join(repoRoot, 'registry.json');
violations.push(
  ...collectViolations(readFileSync(rootRegistry, 'utf8'), 'registry.json'),
);

if (violations.length) {
  console.error('registry URLs must use refs/heads/main in committed registry files:');
  for (const line of violations) {
    console.error(`  ${line}`);
  }
  console.error(
    'Rebuild with default postprocess (REGISTRY_BRANCH=main). For a local branch preview only, set REGISTRY_BRANCH and do not commit public/r.',
  );
  process.exit(1);
}

console.log('verify-registry-refs: ok (public/r and registry.json)');
