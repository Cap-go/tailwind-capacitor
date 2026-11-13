import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;
const vueDir = join(root, 'src/vue/components');
const outDir = join(root, 'src/angular/components');

function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function parseClassesImport(source) {
  const m = source.match(
    /import\s+\{\s*([A-Za-z]+)\s*\}\s+from\s+['"][^'"]*classes\/([A-Za-z]+)Classes/,
  );
  if (m) return { classesFn: m[1], file: m[2] };
  const m2 = source.match(/import\s+\{\s*([A-Za-z]+Classes)\s*\}/);
  return m2 ? { classesFn: m2[1], file: m2[1].replace(/Classes$/, '') } : null;
}

function parseColorsImport(source) {
  const m = source.match(/import\s+\{\s*([A-Za-z]+Colors)\s*\}/);
  return m ? m[1] : null;
}

const names = readdirSync(vueDir)
  .filter((n) => n.endsWith('.vue') && !n.includes('/'))
  .map((n) => basename(n, '.vue'))
  .sort();

mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, 'src/angular/shared'), { recursive: true });

for (const name of names) {
  const source = readFileSync(join(vueDir, `${name}.vue`), 'utf8');
  const meta = parseClassesImport(source);
  if (!meta) continue;
  const colorsFn = parseColorsImport(source);
  const selector = `c-${toKebab(name)}`;
  const classFile = `${meta.file}Classes`;
  const colorsImport = colorsFn
    ? `import { ${colorsFn} } from '../../shared/colors/${meta.file}Colors.js';`
    : '';
  const colorsLine = colorsFn
    ? `const colors = ${colorsFn}(this.colors || {});`
    : 'const colors = {};';

  const ts = `import {
  Component,
  Input,
  inject,
  OnChanges,
  HostBinding,
} from '@angular/core';
import { ${meta.classesFn} } from '../../shared/classes/${classFile}.js';
${colorsImport}
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: '${selector}',
  standalone: true,
  template: '<ng-content />',
})
export class ${name}Component implements OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnChanges(): void {
    const theme = resolveTheme(this.ctx, this);
    ${colorsLine}
    const props = this as Record<string, unknown>;
    const raw = ${meta.classesFn}(props, colors, { className: this.class });
    const c = themeClasses(raw, theme, this.class);
    const base = c.base;
    if (typeof base === 'string') {
      this.hostClass = base;
    } else if (base && typeof base === 'object') {
      this.hostClass = (base as { default?: string }).default || '';
    } else {
      this.hostClass = '';
    }
  }
}
`;
  writeFileSync(join(outDir, `${name}.component.ts`), ts);
}

const provider = `import { Component, Input } from '@angular/core';
import { CAPACITOR_CONTEXT } from './capacitor-context.js';

@Component({
  selector: 'tailwind-capacitor-provider',
  standalone: true,
  template: '<ng-content />',
  providers: [
    {
      provide: CAPACITOR_CONTEXT,
      useFactory: (parent: TailwindCapacitorProviderComponent) => ({
        theme: parent.theme,
        dark: parent.dark,
        touchRipple: parent.touchRipple,
      }),
      deps: [TailwindCapacitorProviderComponent],
    },
  ],
})
export class TailwindCapacitorProviderComponent {
  @Input() theme: 'ios' | 'material' = 'material';
  @Input() dark = true;
  @Input() touchRipple = true;
}
`;

writeFileSync(join(root, 'src/angular/shared/tailwind-capacitor-provider.component.ts'), provider);

const barrel = names
  .map(
    (name) =>
      `export { ${name}Component as ${name} } from './components/${name}.component.js';`,
  )
  .join('\n');

writeFileSync(
  join(root, 'src/angular/capacitor-angular.ts'),
  `export { TailwindCapacitorProviderComponent as TailwindCapacitorProvider } from './shared/tailwind-capacitor-provider.component.js';\n${barrel}\n`,
);

console.log(`generate-angular-components: ${names.length} components`);
