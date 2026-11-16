import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;

function collectExports(source) {
  const names = [];
  for (const m of source.matchAll(/export const (\w+)\s*=/g)) names.push(m[1]);
  for (const m of source.matchAll(/export function (\w+)/g)) names.push(m[1]);
  return [...new Set(names)];
}

function writeDts(dir) {
  let count = 0;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.js')) continue;
    const jsPath = join(dir, name);
    const source = readFileSync(jsPath, 'utf8');
    const exports = collectExports(source);
    if (!exports.length) continue;
    const dts = `${exports
      .map((id) => `export const ${id}: (...args: any[]) => any;`)
      .join('\n')}\n`;
    writeFileSync(jsPath.replace(/\.js$/, '.d.ts'), dts);
    count += 1;
  }
  return count;
}

const classesDir = join(root, 'src/shared/classes');
const colorsDir = join(root, 'src/shared/colors');
const n1 = writeDts(classesDir);
const n2 = writeDts(colorsDir);

function writeUtilityDts(file, exports) {
  const jsPath = join(root, 'src/shared', file);
  const dts = `${exports
    .map((id) => `export const ${id}: (...args: any[]) => any;`)
    .join('\n')}\n`;
  writeFileSync(jsPath.replace(/\.js$/, '.d.ts'), dts);
}

writeUtilityDts('cls.js', collectExports(readFileSync(join(root, 'src/shared/cls.js'), 'utf8')));
writeUtilityDts(
  'position-class.js',
  collectExports(readFileSync(join(root, 'src/shared/position-class.js'), 'utf8')),
);
writeUtilityDts(
  'touch-ripple-class.js',
  collectExports(readFileSync(join(root, 'src/shared/touch-ripple-class.js'), 'utf8')),
);

console.log(`generate-shared-dts: classes ${n1}, colors ${n2}`);
