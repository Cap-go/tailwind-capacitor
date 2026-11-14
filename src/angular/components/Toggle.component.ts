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
import { ToggleClasses } from '../../shared/classes/ToggleClasses.js';
import { ToggleColors } from '../../shared/colors/ToggleColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';

@Component({
  selector: 'c-toggle',
  standalone: true,
  template: `<label [class]="typeof c.base[state] === 'string' ? c.base[state] : (c.base[state] as { default?: string })?.default || ''" [attr.aria-checked]="checked">
    <input
      type="checkbox"
      [class]="typeof c.input === 'string' ? c.input : (c.input as { default?: string })?.default || ''"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      (change)="change.emit($event)"
    />
    <span [class]="typeof c.inner[state] === 'string' ? c.inner[state] : (c.inner[state] as { default?: string })?.default || ''"></span>
    <span [class]="typeof c.thumbWrap[state] === 'string' ? c.thumbWrap[state] : (c.thumbWrap[state] as { default?: string })?.default || ''">
      <span [class]="typeof c.thumb[state] === 'string' ? c.thumb[state] : (c.thumb[state] as { default?: string })?.default || ''"></span>
    </span>
    <ng-content />
  </label>`,
})
export class ToggleComponent implements OnInit, OnChanges {
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

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
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
