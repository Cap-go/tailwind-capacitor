import {
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
import { ToggleClasses } from '../../shared/classes/ToggleClasses.js';
import { ToggleColors } from '../../shared/colors/ToggleColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';

@Component({
  selector: 'c-toggle',
  standalone: true,
  template: `<label [class]="resolveStateClass(c['base'], state)">
    <input
      type="checkbox"
      role="switch"
      [class]="resolveClass(c['input'])"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      [attr.aria-checked]="checked"
      (change)="onCheckedChange($event)"
    />
    <span [class]="resolveStateClass(c['inner'], state)"></span>
    <span [class]="resolveStateClass(c['thumbWrap'], state)">
      <span [class]="resolveStateClass(c['thumb'], state)"></span>
    </span>
    <ng-content />
  </label>`,
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

  resolveClass(value: unknown): string {
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

  private lastCtxDark?: boolean;
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

  private readonly ctx = inject(CAPACITOR_CONTEXT);

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
    const colors = ToggleColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = ToggleClasses(props, colors, { className: this.class }, dark);
    this.c = themeClasses(raw, theme, this.class);
  }
}
