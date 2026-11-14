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
  template: `<label [class]="typeof c.base === 'string' ? c.base : (c.base as { default?: string })?.default || ''" [attr.aria-checked]="checked || indeterminate">
    <input
      #inputEl
      type="checkbox"
      [class]="typeof c.input === 'string' ? c.input : (c.input as { default?: string })?.default || ''"
      [name]="name"
      [value]="value"
      [disabled]="disabled"
      [readOnly]="readonly"
      [checked]="checked"
      (change)="change.emit($event)"
    />
    <i [class]="typeof c.iconWrap[state] === 'string' ? c.iconWrap[state] : (c.iconWrap[state] as { default?: string })?.default || ''">
      @if (indeterminate) {
        <span [class]="typeof c.indeterminateIcon === 'string' ? c.indeterminateIcon : (c.indeterminateIcon as { default?: string })?.default || ''"></span>
      } @else {
        <c-checkbox-icon [ios]="ios" [material]="material" [class]="typeof c.icon[state] === 'string' ? c.icon[state] : (c.icon[state] as { default?: string })?.default || ''" />
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
