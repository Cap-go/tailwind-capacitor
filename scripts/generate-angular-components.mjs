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
    template:
      '<c-button [segmented]="true" [segmentedStrong]="strong" [rounded]="rounded" [segmentedActive]="active"><ng-content /></c-button>',
    inputs:
      '@Input() strong = false;\n  @Input() rounded = false;\n  @Input() active = false;',
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

const extraInputs = {
  List: [
    ['nested', false],
    ['menuList', false],
    ['strong', undefined],
    ['inset', undefined],
  ],
  ListItem: [['menuListItem', false]],
  Button: [
    ['segmented', false],
    ['rounded', undefined],
    ['segmentedActive', false],
    ['segmentedStrong', false],
  ],
  Toolbar: [['tabbar', false]],
  Segmented: [
    ['strong', false],
    ['rounded', false],
  ],
  SegmentedButton: [
    ['strong', false],
    ['rounded', false],
    ['active', false],
  ],
  ListInput: [
    ['label', ''],
    ['placeholder', ''],
    ['type', 'text'],
  ],
};

function extraInputLines(name) {
  const specs = extraInputs[name];
  if (!specs) return '';
  return specs
    .map(([key, def]) => {
      if (def === undefined) return `@Input() ${key}?: boolean;`;
      if (typeof def === 'string') return `@Input() ${key} = ${JSON.stringify(def)};`;
      return `@Input() ${key} = ${def};`;
    })
    .join('\n  ');
}

function resolveClassRef(path) {
  const stateMatch = path.match(/^c\.([a-zA-Z_]+)\[state\]$/);
  if (stateMatch) {
    return `resolveStateClass(c['${stateMatch[1]}'], state)`;
  }
  const bracketed = path.replace(/^c\.([a-zA-Z_]+)/, "c['$1']");
  return `resolveClass(${bracketed})`;
}

const interactiveDoCheckMethod = `  private lastCtxDark?: boolean;
  private readonly cdr = inject(ChangeDetectorRef);

  ngDoCheck(): void {
    if (this.lastCtxDark !== this.ctx.dark) {
      this.lastCtxDark = this.ctx.dark;
      this.syncClasses();
      this.cdr.markForCheck();
    }
  }

  onCheckedChange(ev: Event): void {
    ev.stopPropagation();
    this.checkedChange.emit(ev);
  }

`;

const valueInputMethod = `  onValueInput(ev: Event): void {
    ev.stopPropagation();
    this.valueChange.emit(ev);
  }

`;

const hostDoCheckMethod = `  private lastCtxDark?: boolean;
  private readonly cdr = inject(ChangeDetectorRef);

  ngDoCheck(): void {
    if (this.lastCtxDark !== this.ctx.dark) {
      this.lastCtxDark = this.ctx.dark;
      this.syncHostClass();
      this.cdr.markForCheck();
    }
  }

`;

const resolveClassMethod = `  resolveClass(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const d = obj['default'];
      if (typeof d === 'string') return d;
    }
    return '';
  }

  resolveStateClass(value: unknown, state: string): string {
    if (!value || typeof value !== 'object') return '';
    const bucket = value as Record<string, unknown>;
    return this.resolveClass(bucket[state]);
  }

`;

function interactiveComponent(name, meta, colorsFn) {
  const classFile = `${meta.file}Classes`;
  const colorsImport = colorsFn
    ? `import { ${colorsFn} } from '../../shared/colors/${meta.file}Colors.js';`
    : '';
  const colorsDecl = colorsFn
    ? `const colors = ${colorsFn}(this.colors || {}, dark);`
    : 'const colors = {};';

  const commonHeader = `import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnChanges,
  DoCheck,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ${meta.classesFn} } from '../../shared/classes/${classFile}.js';
${colorsImport}
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';`;

  if (name === 'Toggle') {
    return `${commonHeader}

@Component({
  selector: 'c-toggle',
  standalone: true,
  template: \`<label [class]="${resolveClassRef('c.base[state]')}">
    <input
      type="checkbox"
      role="switch"
      [class]="${resolveClassRef('c.input')}"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      [attr.aria-checked]="checked"
      (change)="onCheckedChange($event)"
    />
    <span [class]="${resolveClassRef('c.inner[state]')}"></span>
    <span [class]="${resolveClassRef('c.thumbWrap[state]')}">
      <span [class]="${resolveClassRef('c.thumb[state]')}"></span>
    </span>
    <ng-content />
  </label>\`,
})
export class ToggleComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() checked = false;
  @Input() name?: string;
  @Input() value?: string | number;
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() checkedChange = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  state: 'checked' | 'notChecked' = 'notChecked';

${resolveClassMethod}${interactiveDoCheckMethod}  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
    this.syncClasses();
  }

  ngOnChanges(): void {
    this.syncClasses();
  }

  private syncClasses(): void {
    this.state = this.checked ? 'checked' : 'notChecked';
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    ${colorsDecl}
    const props = this as Record<string, unknown>;
    const raw = ${meta.classesFn}(props, colors, { className: this.class }, dark);
    this.c = themeClasses(raw, theme, this.class);
  }
}
`;
  }

  if (name === 'Checkbox') {
    return `${commonHeader}
import { CheckboxIconComponent } from './icons/CheckboxIcon.component.js';

@Component({
  selector: 'c-checkbox',
  standalone: true,
  imports: [CheckboxIconComponent],
  template: \`<label [class]="${resolveClassRef('c.base')}" [attr.aria-checked]="checked || indeterminate">
    <input
      #inputEl
      type="checkbox"
      [class]="${resolveClassRef('c.input')}"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      (change)="onCheckedChange($event)"
    />
    <i [class]="${resolveClassRef('c.iconWrap[state]')}">
      @if (indeterminate) {
        <span [class]="${resolveClassRef('c.indeterminateIcon')}"></span>
      } @else {
        <c-checkbox-icon [ios]="ios" [material]="material" [class]="${resolveClassRef('c.icon[state]')}" />
      }
    </i>
    <ng-content />
  </label>\`,
})
export class CheckboxComponent implements OnInit, OnChanges, AfterViewInit, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() name?: string;
  @Input() value?: string | number;
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() checkedChange = new EventEmitter<Event>();

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;

  c: Record<string, unknown> = {};
  state: 'checked' | 'notChecked' = 'notChecked';

${resolveClassMethod}${interactiveDoCheckMethod}  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
    this.syncClasses();
  }

  ngOnChanges(): void {
    this.syncClasses();
    this.syncIndeterminate();
  }

  ngAfterViewInit(): void {
    this.syncIndeterminate();
  }

  private syncIndeterminate(): void {
    if (this.inputEl?.nativeElement) {
      this.inputEl.nativeElement.indeterminate = this.indeterminate;
    }
  }

  private syncClasses(): void {
    this.state =
      this.checked || this.indeterminate ? 'checked' : 'notChecked';
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    ${colorsDecl}
    const props = this as Record<string, unknown>;
    const raw = ${meta.classesFn}(props, colors, { className: this.class }, dark);
    this.c = themeClasses(raw, theme, this.class);
  }
}
`;
  }

  if (name === 'Radio') {
    return `${commonHeader}
import { CheckboxIconComponent } from './icons/CheckboxIcon.component.js';

@Component({
  selector: 'c-radio',
  standalone: true,
  imports: [CheckboxIconComponent],
  template: \`<label [class]="${resolveClassRef('c.base')}" [attr.aria-checked]="checked">
    <input
      type="radio"
      [class]="${resolveClassRef('c.input')}"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      (change)="onCheckedChange($event)"
    />
    <i [class]="${resolveClassRef('c.iconWrap[state]')}">
      @if (theme === 'ios') {
        <c-checkbox-icon [ios]="ios" [material]="material" [class]="${resolveClassRef('c.icon[state]')}" />
      } @else {
        <span [class]="${resolveClassRef('c.icon[state]')}"></span>
      }
    </i>
    <ng-content />
  </label>\`,
})
export class RadioComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() checked = false;
  @Input() name?: string;
  @Input() value?: string | number;
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() checkedChange = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  state: 'checked' | 'notChecked' = 'notChecked';
  theme = 'ios';

${resolveClassMethod}${interactiveDoCheckMethod}  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
    this.syncClasses();
  }

  ngOnChanges(): void {
    this.syncClasses();
  }

  private syncClasses(): void {
    this.state = this.checked ? 'checked' : 'notChecked';
    this.theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    ${colorsDecl}
    const props = this as Record<string, unknown>;
    const raw = ${meta.classesFn}(props, colors, { className: this.class }, dark);
    this.c = themeClasses(raw, this.theme, this.class);
  }
}
`;
  }

  if (name === 'Range') {
    return `${commonHeader}

@Component({
  selector: 'c-range',
  standalone: true,
  template: \`<div [class]="${resolveClassRef('c.base')}">
    <span [class]="${resolveClassRef('c.trackBg')}"></span>
    <span [class]="${resolveClassRef('c.trackValue')}" [style.width.%]="valueWidth"></span>
    <input
      [class]="rangeInputClass"
      type="range"
      [attr.id]="inputId"
      [name]="name"
      [min]="min"
      [max]="max"
      [step]="step"
      [value]="currentValue"
      [readOnly]="readonly"
      [disabled]="disabled"
      [attr.aria-valuemin]="min"
      [attr.aria-valuemax]="max"
      [attr.aria-valuenow]="currentValue"
      (input)="onValueInput($event)"
      (change)="onCheckedChange($event)"
      (focus)="focus.emit($event)"
      (blur)="blur.emit($event)"
    />
  </div>\`,
})
export class RangeComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() inputId?: string;
  @Input() name?: string;
  @Input() value?: number;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() step = 1;
  @Input() min = 0;
  @Input() max = 100;

  @Output() valueChange = new EventEmitter<Event>();
  @Output() checkedChange = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  valueWidth = 0;
  rangeInputClass = '';

${resolveClassMethod}${interactiveDoCheckMethod}${valueInputMethod}  private readonly ctx = inject(CAPACITOR_CONTEXT);

  get currentValue(): number {
    return this.value ?? this.min;
  }

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
    this.syncClasses();
  }

  ngOnChanges(): void {
    this.syncClasses();
  }

  private syncClasses(): void {
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    ${colorsDecl}
    const props = this as Record<string, unknown>;
    const raw = ${meta.classesFn}(props, colors, dark);
    this.c = themeClasses(raw, theme, this.class);
    const range = this.max - this.min;
    const val = this.currentValue;
    this.valueWidth =
      range > 0 ? Math.max(0, Math.min(100, ((val - this.min) / range) * 100)) : 0;
    const c = this.c;
    this.rangeInputClass = cls(
      c['input'] as string,
      c['inputThumb'] as string,
      c['inputTrack'] as string,
    );
  }
}
`;
  }

  if (name === 'Searchbar') {
    return `${commonHeader}
import { SearchIconComponent } from './icons/SearchIcon.component.js';
import { DeleteIconComponent } from './icons/DeleteIcon.component.js';

@Component({
  selector: 'c-searchbar',
  standalone: true,
  imports: [SearchIconComponent, DeleteIconComponent],
  template: \`<div [class]="${resolveClassRef('c.base')}" role="search">
    <div [class]="${resolveClassRef('c.inner')}">
      <span [class]="${resolveClassRef('c.searchIconWrap')}">
        <c-search-icon [ios]="ios" [material]="material" [class]="${resolveClassRef('c.searchIcon')}" />
      </span>
      <input
        #searchEl
        [attr.id]="inputId"
        type="search"
        name="search"
        [class]="${resolveClassRef('c.input')}"
        [placeholder]="placeholder"
        [value]="displayValue"
        [attr.aria-label]="placeholder"
        (input)="onValueInput($event)"
        (change)="onCheckedChange($event)"
        (focus)="onFocus($event)"
        (blur)="blur.emit($event)"
      />
      @if (displayValue && clearButton) {
        <button
          type="button"
          [class]="${resolveClassRef('c.clearButton')}"
          [attr.aria-label]="'Clear search'"
          (click)="clear.emit($event)"
        >
          <c-delete-icon [class]="${resolveClassRef('c.deleteIcon')}" />
        </button>
      }
    </div>
    <ng-content />
  </div>\`,
})
export class SearchbarComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() placeholder = 'Search';
  @Input() value?: string | number;
  @Input() inputId?: string;
  @Input() clearButton = true;

  @Output() checkedChange = new EventEmitter<Event>();
  @Output() valueChange = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() clear = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  isEnabled = false;

${resolveClassMethod}${interactiveDoCheckMethod}${valueInputMethod}  private readonly ctx = inject(CAPACITOR_CONTEXT);

  get displayValue(): string {
    if (this.value === undefined || this.value === null) return '';
    return String(this.value);
  }

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
    this.syncClasses();
  }

  ngOnChanges(): void {
    this.syncClasses();
  }

  onFocus(event: Event): void {
    this.isEnabled = true;
    this.syncClasses();
    this.focus.emit(event);
  }

  private syncClasses(): void {
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    ${colorsDecl}
    const props = { ...(this as Record<string, unknown>), isEnabled: this.isEnabled };
    const raw = ${meta.classesFn}(props, colors, {
      isEnabled: this.isEnabled,
      darkClasses: dark,
    });
    this.c = themeClasses(raw, theme, this.class);
  }
}
`;
  }

  if (name === 'ListInput') {
    return `${commonHeader}

@Component({
  selector: 'c-list-input',
  standalone: true,
  template: \`<li [class]="baseClass">
    @if (label) {
      <div [class]="labelClass">
        <div [class]="labelTextClass">{{ label }}</div>
      </div>
    }
    <div [class]="inputWrapClass">
      @if (type === 'textarea') {
        <textarea
          [class]="inputClass"
          [name]="name"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readOnly]="readonly"
          [required]="required"
          [attr.aria-label]="label || placeholder"
          (input)="onValueInput($event)"
          (change)="onCheckedChange($event)"
          (focus)="onFocus($event)"
          (blur)="onBlur($event)"
        >{{ textValue }}</textarea>
      } @else if (type === 'select') {
        <select
          [class]="inputClass"
          [name]="name"
          [disabled]="disabled"
          [required]="required"
          [attr.aria-label]="label || placeholder"
          (change)="onCheckedChange($event)"
          (focus)="onFocus($event)"
          (blur)="onBlur($event)"
        >
          <ng-content />
        </select>
      } @else {
        <input
          [class]="inputClass"
          [type]="type"
          [name]="name"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readOnly]="readonly"
          [required]="required"
          [value]="textValue"
          [attr.aria-label]="label || placeholder"
          (input)="onValueInput($event)"
          (change)="onCheckedChange($event)"
          (focus)="onFocus($event)"
          (blur)="onBlur($event)"
        />
      }
    </div>
    <ng-content />
  </li>\`,
})
export class ListInputComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  ${extraInputLines('ListInput')}
  @Input() name?: string;
  @Input() value?: string | number;
  @Input() readonly = false;
  @Input() required = false;
  @Input() disabled = false;

  @Output() checkedChange = new EventEmitter<Event>();
  @Output() valueChange = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  baseClass = '';
  labelClass = '';
  labelTextClass = '';
  inputWrapClass = '';
  inputClass = '';
  focused = false;

${resolveClassMethod}${interactiveDoCheckMethod}${valueInputMethod}  private readonly ctx = inject(CAPACITOR_CONTEXT);

  get textValue(): string {
    if (this.value === undefined || this.value === null) return '';
    return String(this.value);
  }

  ngOnInit(): void {
    this.syncClasses();
  }

  ngOnChanges(): void {
    this.syncClasses();
  }

  onFocus(event: Event): void {
    this.focused = true;
    this.syncClasses();
    this.focus.emit(event);
  }

  onBlur(event: Event): void {
    this.focused = false;
    this.syncClasses();
    this.blur.emit(event);
  }

  private pickClass(segment: unknown): string {
    if (typeof segment === 'string') return segment;
    if (segment && typeof segment === 'object') {
      const obj = segment as Record<string, string>;
      return obj['default'] || obj['stacked'] || obj['notFloating'] || '';
    }
    return '';
  }

  private syncClasses(): void {
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    ${colorsDecl}
    const props = this as Record<string, unknown>;
    const getLabelColor = () => '';
    const raw = ${meta.classesFn}(props, colors, {
      isFloatingTransformed: false,
      isFocused: this.focused,
      darkClasses: dark,
      getLabelColor,
      outline: false,
      hasLabel: !!this.label,
    });
    this.c = themeClasses(raw, theme, this.class);
    const c = this.c as Record<string, unknown>;
    this.baseClass = this.pickClass(c['base']);
    const label = c['label'] as Record<string, unknown> | undefined;
    this.labelClass = this.pickClass(label?.['stacked']);
    this.labelTextClass = this.pickClass(c['labelText']);
    const inputWrap = c['inputWrap'] as Record<string, unknown> | undefined;
    this.inputWrapClass = this.pickClass(inputWrap?.['stacked']);
    const input = c['input'] as Record<string, unknown> | undefined;
    this.inputClass =
      this.pickClass(input?.['notFloating']) || this.pickClass(input);
  }
}
`;
  }

  return null;
}

const interactiveNames = new Set([
  'Toggle',
  'Checkbox',
  'Radio',
  'Range',
  'Searchbar',
  'ListInput',
]);

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
  const extra = extraInputLines(name);

  if (interactiveNames.has(name)) {
    const src = interactiveComponent(name, meta, colorsFn);
    if (src) {
      writeFileSync(join(outDir, `${name}.component.ts`), src);
      continue;
    }
  }

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
  DoCheck,
  ChangeDetectorRef,
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
export class ${name}Component implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  ${extra}

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
    this.syncHostClass();
  }

  ngOnChanges(): void {
    this.syncHostClass();
  }

${hostDoCheckMethod}
  private syncHostClass(): void {
    const theme = resolveTheme(this.ctx, this);
    ${colorsBlock}
    const props = this as Record<string, unknown>;
    const raw = ${meta.classesFn}(props, colors, { className: this.class }, dark);
    const c = themeClasses(raw, theme, this.class);
    const base = c['base'];
    if (typeof base === 'string') {
      this.hostClass = base;
    } else if (base && typeof base === 'object') {
      const baseRecord = base as Record<string, unknown>;
      const d = baseRecord['default'];
      this.hostClass = typeof d === 'string' ? d : '';
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
  `import {
  Component,
  Input,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CAPACITOR_CONTEXT } from './capacitor-context.js';

@Component({
  selector: 'tailwind-capacitor-provider',
  standalone: true,
  template:
    '<div class="min-h-full w-full" [class.dark]="effectiveDark"><ng-content /></div>',
  providers: [
    {
      provide: CAPACITOR_CONTEXT,
      useFactory: () => {
        const parent = inject(TailwindCapacitorProviderComponent);
        return {
          get theme() {
            return parent.theme;
          },
          get dark() {
            return parent.effectiveDark;
          },
          get touchRipple() {
            return parent.touchRipple;
          },
        };
      },
    },
  ],
})
export class TailwindCapacitorProviderComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() theme: 'ios' | 'material' = 'material';
  @Input() dark?: boolean;
  @Input() touchRipple = true;

  effectiveDark = false;

  private media?: MediaQueryList;
  private onSchemeChange?: () => void;

  ngOnInit(): void {
    this.refreshEffectiveDark();
    if (this.dark === undefined && typeof window !== 'undefined') {
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
      this.effectiveDark = this.media.matches;
      this.onSchemeChange = () => {
        if (this.dark === undefined && this.media) {
          this.effectiveDark = this.media.matches;
        }
      };
      this.media.addEventListener('change', this.onSchemeChange);
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.refreshEffectiveDark();
  }

  ngOnDestroy(): void {
    if (this.media && this.onSchemeChange) {
      this.media.removeEventListener('change', this.onSchemeChange);
    }
  }

  private refreshEffectiveDark(): void {
    if (this.dark !== undefined) {
      this.effectiveDark = this.dark;
    }
  }
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
