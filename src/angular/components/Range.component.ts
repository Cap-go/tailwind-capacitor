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
import { RangeClasses } from '../../shared/classes/RangeClasses.js';
import { RangeColors } from '../../shared/colors/RangeColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';

@Component({
  selector: 'c-range',
  standalone: true,
  template: `<div [class]="resolveClass(c['base'])">
    <span [class]="resolveClass(c['trackBg'])"></span>
    <span [class]="resolveClass(c['trackValue'])" [style.width.%]="valueWidth"></span>
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
  </div>`,
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

  onValueInput(ev: Event): void {
    ev.stopPropagation();
    this.valueChange.emit(ev);
  }

  private readonly ctx = inject(CAPACITOR_CONTEXT);

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
    const colors = RangeColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = RangeClasses(props, colors, dark);
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
