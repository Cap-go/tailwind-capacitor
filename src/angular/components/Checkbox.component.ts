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
import { CheckboxClasses } from '../../shared/classes/CheckboxClasses.js';
import { CheckboxColors } from '../../shared/colors/CheckboxColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';
import { CheckboxIconComponent } from './icons/CheckboxIcon.component.js';

@Component({
  selector: 'c-checkbox',
  standalone: true,
  imports: [CheckboxIconComponent],
  template: `<label [class]="resolveClass(c['base'])" [attr.aria-checked]="checked || indeterminate">
    <input
      #inputEl
      type="checkbox"
      [class]="resolveClass(c['input'])"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      (change)="change.emit($event)"
    />
    <i [class]="resolveStateClass(c['iconWrap'], state)">
      @if (indeterminate) {
        <span [class]="resolveClass(c['indeterminateIcon'])"></span>
      } @else {
        <c-checkbox-icon [ios]="ios" [material]="material" [class]="resolveStateClass(c['icon'], state)" />
      }
    </i>
    <ng-content />
  </label>`,
})
export class CheckboxComponent implements OnInit, OnChanges, AfterViewInit {
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

  @Output() change = new EventEmitter<Event>();

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;

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

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
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
    const colors = CheckboxColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = CheckboxClasses(props, colors, { className: this.class }, dark);
    this.c = themeClasses(raw, theme, this.class);
  }
}
