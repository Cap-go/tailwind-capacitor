import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnChanges,
  DoCheck,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ListInputClasses } from '../../shared/classes/ListInputClasses.js';
import { ListInputColors } from '../../shared/colors/ListInputColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';

@Component({
  selector: 'c-list-input',
  standalone: true,
  template: `<li [class]="baseClass">
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
  </li>`,
})
export class ListInputComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() label = "";
  @Input() placeholder = "";
  @Input() type = "text";
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

  ngDoCheck(): void {
    if (this.lastCtxDark !== this.ctx.dark) {
      this.lastCtxDark = this.ctx.dark;
      this.syncClasses();
    }
  }

  onCheckedChange(ev: Event): void {
    ev.stopPropagation();
    this.checkedChange.emit(ev);
  }

  onValueInput(ev: Event): void {
    ev.stopPropagation();
    this.valueChange.emit(ev);
  }

  private readonly ctx = inject(CAPACITOR_CONTEXT);

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
    const colors = ListInputColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const getLabelColor = () => '';
    const raw = ListInputClasses(props, colors, {
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
