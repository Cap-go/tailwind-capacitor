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
  template: `<label [class]="typeof c.base === 'string' ? c.base : (c.base as { default?: string })?.default || ''" [attr.aria-checked]="checked">
    <input
      type="radio"
      [class]="typeof c.input === 'string' ? c.input : (c.input as { default?: string })?.default || ''"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      (change)="change.emit($event)"
    />
    <i [class]="typeof c.iconWrap[state] === 'string' ? c.iconWrap[state] : (c.iconWrap[state] as { default?: string })?.default || ''">
      @if (theme === 'ios') {
        <c-checkbox-icon [class]="typeof c.icon[state] === 'string' ? c.icon[state] : (c.icon[state] as { default?: string })?.default || ''" />
      } @else {
        <span [class]="typeof c.icon[state] === 'string' ? c.icon[state] : (c.icon[state] as { default?: string })?.default || ''"></span>
      }
    </i>
    <ng-content />
  </label>`,
})
export class RadioComponent implements OnInit, OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() checked = false;
  @Input() name?: string;
  @Input() value?: string | number;
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() change = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  state: 'checked' | 'notChecked' = 'notChecked';
  theme = 'ios';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
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
