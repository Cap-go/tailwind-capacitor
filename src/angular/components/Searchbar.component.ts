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
  template: `<div [class]="resolveClass(c['base'])" role="search">
    <div [class]="resolveClass(c['inner'])">
      <span [class]="resolveClass(c['searchIconWrap'])">
        <c-search-icon [ios]="ios" [material]="material" [class]="resolveClass(c['searchIcon'])" />
      </span>
      <input
        #searchEl
        [attr.id]="inputId"
        type="search"
        name="search"
        [class]="resolveClass(c['input'])"
        [placeholder]="placeholder"
        [value]="displayValue"
        [attr.aria-label]="placeholder"
        (input)="onValueInput($event)"
        (change)="onCheckedChange($event)"
        (focus)="onFocus($event)"
        (blur)="blur.emit($event)"
      />
      @if (displayValue && clearButton) {
        <button
          type="button"
          [class]="resolveClass(c['clearButton'])"
          [attr.aria-label]="'Clear search'"
          (click)="clear.emit($event)"
        >
          <c-delete-icon [class]="resolveClass(c['deleteIcon'])" />
        </button>
      }
    </div>
    <ng-content />
  </div>`,
})
export class SearchbarComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() placeholder = 'Search';
  @Input() value?: string | number;
  @Input() inputId?: string;
  @Input() clearButton = true;

  @Output() checkedChange = new EventEmitter<Event>();
  @Output() valueChange = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() clear = new EventEmitter<Event>();

  c: Record<string, unknown> = {};
  isEnabled = false;

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

  get displayValue(): string {
    if (this.value === undefined || this.value === null) return '';
    return String(this.value);
  }

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
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
