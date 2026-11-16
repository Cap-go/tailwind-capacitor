import { readFileSync, readdirSync, statSync } from 'node:fs';
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
const root = repoRoot;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!name.endsWith('.json')) continue;
    const rel = path.replace(`${root}/`, '');
    violations.push(
      ...collectViolations(readFileSync(path, 'utf8'), rel),
    );
  }
}

walk(join(root, 'public/r'));
violations.push(
  ...collectViolations(readFileSync(join(root, 'registry.json'), 'utf8'), 'registry.json'),
);
violations.push(
  ...collectViolations(readFileSync(join(root, 'registry-react.json'), 'utf8'), 'registry-react.json'),
);
violations.push(
  ...collectViolations(readFileSync(join(root, 'registry-angular.json'), 'utf8'), 'registry-angular.json'),
);

if (violations.length) {
  console.error('registry URLs must use refs/heads/main in committed registry files:');
  for (const line of violations) {
    console.error(`  ${line}`);
  }
  process.exit(1);
}

console.log('verify-registry-refs: ok (public/r and registry manifests)');
