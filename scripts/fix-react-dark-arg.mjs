import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const dir = join(repoRoot, 'src/react/components');
let n = 0;
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.tsx')) continue;
  const path = join(dir, file);
  let src = readFileSync(path, 'utf8');
  const before = src;
  src = src.replace(
    /([A-Za-z]+Classes)\(([^;]+),\s*colors,\s*dark\)/g,
    (match, fn, args) => {
      if (args.includes('className')) {
        return `${fn}(${args}, { className }, dark)`;
      }
      return `${fn}(${args}, { className: className ?? '' }, dark)`;
    },
  );
  if (src !== before) {
    writeFileSync(path, src);
    n += 1;
  }
}
console.log(`fix-react-dark-arg: ${n} files`);