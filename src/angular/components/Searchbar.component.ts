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
import { SearchbarClasses } from '../../shared/classes/SearchbarClasses.js';
import { SearchbarColors } from '../../shared/colors/SearchbarColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';
import { cls } from '../../shared/cls.js';
import { SearchIconComponent } from './icons/SearchIcon.component.js';
import { DeleteIconComponent } from './icons/DeleteIcon.component.js';

@Component({
  selector: 'c-searchbar',
  standalone: true,
  imports: [SearchIconComponent, DeleteIconComponent],
  template: `<div [class]="typeof c.base === 'string' ? c.base : (c.base as { default?: string })?.default || ''" role="search">
    <div [class]="typeof c.inner === 'string' ? c.inner : (c.inner as { default?: string })?.default || ''">
      <span [class]="typeof c.searchIconWrap === 'string' ? c.searchIconWrap : (c.searchIconWrap as { default?: string })?.default || ''">
        <c-search-icon [class]="typeof c.searchIcon === 'string' ? c.searchIcon : (c.searchIcon as { default?: string })?.default || ''" />
      </span>
      <input
        #searchEl
        [attr.id]="inputId"
        type="search"
        name="search"
        [class]="typeof c.input === 'string' ? c.input : (c.input as { default?: string })?.default || ''"
        [placeholder]="placeholder"
        [value]="displayValue"
        [attr.aria-label]="placeholder"
        (input)="input.emit($event)"
        (change)="change.emit($event)"
        (focus)="onFocus($event)"
        (blur)="blur.emit($event)"
      />
      @if (displayValue && clearButton) {
        <button
          type="button"
          [class]="typeof c.clearButton === 'string' ? c.clearButton : (c.clearButton as { default?: string })?.default || ''"
          [attr.aria-label]="'Clear search'"
          (click)="clear.emit($event)"
        >
          <c-delete-icon [class]="typeof c.deleteIcon === 'string' ? c.deleteIcon : (c.deleteIcon as { default?: string })?.default || ''" />
        </button>
      }
    </div>
    <ng-content />
  </div>`,
})
export class SearchbarComponent implements OnInit, OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() placeholder = 'Search';
  @Input() value?: string | number;
  @Input() inputId?: string;
  @Input() clearButton = true;

  @Output() change = new EventEmitter<Event>();
  @Output() input = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() clear = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  isEnabled = false;

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  get displayValue(): string {
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
    this.isEnabled = true;
    this.syncClasses();
    this.focus.emit(event);
  }

  private syncClasses(): void {
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    const colors = SearchbarColors(this.colors || {}, dark);
    const props = { ...(this as Record<string, unknown>), isEnabled: this.isEnabled };
    const raw = SearchbarClasses(props, colors, {
      isEnabled: this.isEnabled,
      darkClasses: dark,
    });
    this.c = themeClasses(raw, theme, this.class);
  }
}
