import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const iconsDir = join(repoRoot, 'src/vue/components/icons');
const outDir = join(repoRoot, 'src/angular/components/icons');
mkdirSync(outDir, { recursive: true });

function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function convertTemplate(inner) {
  let t = inner
    .replace(/:fill="([^"]+)"/g, '[attr.fill]="$1"')
    .replace(/:class="([^"]+)"/g, '[class]="$1"');
  const svgs = [...t.matchAll(/<svg[\s\S]*?<\/svg>/g)].map((m) => m[0]);
  if (t.includes("v-if=\"theme === 'ios'\"") && svgs.length >= 2) {
    return `@if (resolveTheme() === 'ios') {\n${svgs[0]}\n} @else {\n${svgs[1]}\n}`;
  }
  return t.replace(/\s+v-if="([^"]+)"/g, ' @if ($1) {').replace(/\s+v-else/g, ' } @else {');
}

for (const file of readdirSync(iconsDir).filter((n) => n.endsWith('.vue'))) {
  const name = basename(file, '.vue');
  const source = readFileSync(join(iconsDir, file), 'utf8');
  const templateMatch = source.match(/<template>([\s\S]*?)<\/template>/);
  const inner = templateMatch ? templateMatch[1].trim() : '';
  const template = convertTemplate(inner).replace(/`/g, '\\`');
  const ts = `import { Component, Input } from '@angular/core';

@Component({
  selector: 'c-${kebab(name)}',
  standalone: true,
  template: \`${template}\`,
})
export class ${name}Component {
  @Input() theme?: 'ios' | 'material';
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() fill?: string;

  resolveTheme(): 'ios' | 'material' {
    if (this.ios) return 'ios';
    if (this.material) return 'material';
    if (this.theme === 'ios' || this.theme === 'material') return this.theme;
    return 'material';
  }
}
`;
  writeFileSync(join(outDir, `${name}.component.ts`), ts);
}

console.log(`generate-angular-icons: ${readdirSync(outDir).length} icons`);