import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnChanges,
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
  template: `<div [class]="typeof c.base === 'string' ? c.base : (c.base as { default?: string })?.default || ''">
    <span [class]="typeof c.trackBg === 'string' ? c.trackBg : (c.trackBg as { default?: string })?.default || ''"></span>
    <span [class]="typeof c.trackValue === 'string' ? c.trackValue : (c.trackValue as { default?: string })?.default || ''" [style.width.%]="valueWidth"></span>
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
      (input)="input.emit($event)"
      (change)="change.emit($event)"
      (focus)="focus.emit($event)"
      (blur)="blur.emit($event)"
    />
  </div>`,
})
export class RangeComponent implements OnInit, OnChanges {
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

  @Output() input = new EventEmitter<Event>();
  @Output() change = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  valueWidth = 0;
  rangeInputClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  get currentValue(): number {
    return this.value ?? this.min;
  }

  ngOnInit(): void {
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
      c.input as string,
      c.inputThumb as string,
      c.inputTrack as string,
    );
  }
}
