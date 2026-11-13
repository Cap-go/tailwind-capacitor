import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const iconsDir = join(repoRoot, 'src/vue/components/icons');
const outDir = join(repoRoot, 'src/angular/components/icons');
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(iconsDir).filter((n) => n.endsWith('.vue'))) {
  const name = basename(file, '.vue');
  const source = readFileSync(join(iconsDir, file), 'utf8');
  const templateMatch = source.match(/<template>([\s\S]*?)<\/template>/);
  const inner = templateMatch ? templateMatch[1].trim() : '';
  const ts = `import { Component } from '@angular/core';

@Component({
  selector: 'c-${name.replace(/([A-Z])/g, (m, l, i) => (i ? '-' : '') + l.toLowerCase())}',
  standalone: true,
  template: \`${inner.replace(/`/g, '\\`')}\`,
})
export class ${name}Component {}
`;
  writeFileSync(join(outDir, `${name}.component.ts`), ts);
}

console.log(`generate-angular-icons: ${readdirSync(outDir).length} icons`);
