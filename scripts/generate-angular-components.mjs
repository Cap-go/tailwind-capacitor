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

const wrappers = {
  ListGroup: {
    imports: "import { ListComponent } from './List.component.js';",
    deps: 'ListComponent',
    template: '<c-list [nested]="true"><ng-content /></c-list>',
    inputs: '',
  },
  MenuList: {
    imports: "import { ListComponent } from './List.component.js';",
    deps: 'ListComponent',
    template: '<c-list [menuList]="true"><ng-content /></c-list>',
    inputs: '',
  },
  MenuListItem: {
    imports: "import { ListItemComponent } from './ListItem.component.js';",
    deps: 'ListItemComponent',
    template:
      '<c-list-item [menuListItem]="true"><ng-content /></c-list-item>',
    inputs: '',
  },
  SegmentedButton: {
    imports: "import { ButtonComponent } from './Button.component.js';",
    deps: 'ButtonComponent',
    template: '<c-button [segmented]="true"><ng-content /></c-button>',
    inputs: '',
  },
  Tabbar: {
    imports: "import { ToolbarComponent } from './Toolbar.component.js';",
    deps: 'ToolbarComponent',
    template: '<c-toolbar [tabbar]="true"><ng-content /></c-toolbar>',
    inputs: '',
  },
  Tabs: {
    imports: "import { SegmentedComponent } from './Segmented.component.js';",
    deps: 'SegmentedComponent',
    template:
      '<c-segmented [strong]="true" [rounded]="true"><ng-content /></c-segmented>',
    inputs: '',
  },
  Tab: {
    imports:
      "import { SegmentedButtonComponent } from './SegmentedButton.component.js';",
    deps: 'SegmentedButtonComponent',
    template:
      '<c-segmented-button [strong]="true" [rounded]="true" [active]="active"><ng-content /></c-segmented-button>',
    inputs: '@Input() active = false;',
  },
  Select: {
    imports:
      "import { ListComponent } from './List.component.js';\nimport { ListInputComponent } from './ListInput.component.js';",
    deps: 'ListComponent, ListInputComponent',
    template:
      '<c-list [strong]="true" [inset]="true"><c-list-input type="select" [label]="label"><ng-content /></c-list-input></c-list>',
    inputs: '@Input() label = "Select";',
  },
  Textarea: {
    imports:
      "import { ListComponent } from './List.component.js';\nimport { ListInputComponent } from './ListInput.component.js';",
    deps: 'ListComponent, ListInputComponent',
    template:
      '<c-list [strong]="true" [inset]="true"><c-list-input type="textarea" [label]="label" [placeholder]="placeholder" /></c-list>',
    inputs:
      '@Input() label = "Notes";\n  @Input() placeholder = "";',
  },
};

function writeWrapper(name, spec) {
  const selector = `c-${toKebab(name)}`;
  const ts = `import { Component, Input } from '@angular/core';
${spec.imports}

@Component({
  selector: '${selector}',
  standalone: true,
  imports: [${spec.deps}],
  template: \`${spec.template}\`,
})
export class ${name}Component {
  ${spec.inputs}
}
`;
  writeFileSync(join(outDir, `${name}.component.ts`), ts);
}

const names = readdirSync(vueDir)
  .filter((n) => n.endsWith('.vue') && !n.includes('/'))
  .map((n) => basename(n, '.vue'))
  .sort();

mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, 'src/angular/shared'), { recursive: true });

for (const name of names) {
  if (wrappers[name]) {
    writeWrapper(name, wrappers[name]);
    continue;
  }
  const source = readFileSync(join(vueDir, `${name}.vue`), 'utf8');
  const meta = parseClassesImport(source);
  if (!meta) {
    console.warn(`angular: skip ${name} (no Classes import)`);
    continue;
  }
  const colorsFn = parseColorsImport(source);
  const selector = `c-${toKebab(name)}`;
  const classFile = `${meta.file}Classes`;
  const colorsImport = colorsFn
    ? `import { ${colorsFn} } from '../../shared/colors/${meta.file}Colors.js';`
    : '';
  const colorsBlock = colorsFn
    ? `const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    const colors = ${colorsFn}(this.colors || {}, dark);`
    : `const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    const colors = {};`;

  const ts = `import {
  Component,
  Input,
  inject,
  OnInit,
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
export class ${name}Component implements OnInit, OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
    this.syncHostClass();
  }

  ngOnChanges(): void {
    this.syncHostClass();
  }

  private syncHostClass(): void {
    const theme = resolveTheme(this.ctx, this);
    ${colorsBlock}
    const props = this as Record<string, unknown>;
    const raw = ${meta.classesFn}(props, colors, { className: this.class }, dark);
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

writeFileSync(
  join(root, 'src/angular/shared/tailwind-capacitor-provider.component.ts'),
  `import { Component, Input } from '@angular/core';
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
`,
);

const generated = readdirSync(outDir)
  .filter((n) => n.endsWith('.component.ts'))
  .map((n) => basename(n, '.component.ts'))
  .sort();

writeFileSync(
  join(root, 'src/angular/capacitor-angular.ts'),
  `export { TailwindCapacitorProviderComponent as TailwindCapacitorProvider } from './shared/tailwind-capacitor-provider.component.js';\n${generated
    .map(
      (name) =>
        `export { ${name}Component as ${name} } from './components/${name}.component.js';`,
    )
    .join('\n')}\n`,
);

console.log(`generate-angular-components: ${generated.length} components`);
