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
import { RadioClasses } from '../../shared/classes/RadioClasses.js';
import { RadioColors } from '../../shared/colors/RadioColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';
import { CheckboxIconComponent } from './icons/CheckboxIcon.component.js';

@Component({
  selector: 'c-radio',
  standalone: true,
  imports: [CheckboxIconComponent],
  template: `<label [class]="resolveClass(c['base'])" [attr.aria-checked]="checked">
    <input
      type="radio"
      [class]="resolveClass(c['input'])"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      (change)="onCheckedChange($event)"
    />
    <i [class]="resolveStateClass(c['iconWrap'], state)">
      @if (theme === 'ios') {
        <c-checkbox-icon [ios]="ios" [material]="material" [class]="resolveStateClass(c['icon'], state)" />
      } @else {
        <span [class]="resolveStateClass(c['icon'], state)"></span>
      }
    </i>
    <ng-content />
  </label>`,
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
    this.theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    const colors = RadioColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = RadioClasses(props, colors, { className: this.class }, dark);
    this.c = themeClasses(raw, this.theme, this.class);
  }
}
