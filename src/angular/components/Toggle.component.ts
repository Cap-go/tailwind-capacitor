import {
  Component,
  Input,
  inject,
  OnInit,
  OnChanges,
  HostBinding,
} from '@angular/core';
import { ToggleClasses } from '../../shared/classes/ToggleClasses.js';
import { ToggleColors } from '../../shared/colors/ToggleColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-toggle',
  standalone: true,
  template: '<ng-content />',
})
export class ToggleComponent implements OnInit, OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
    this.syncHostClass();
  }

  ngOnChanges(): void {
    this.syncHostClass();
  }

  private syncHostClass(): void {
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    const colors = ToggleColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = ToggleClasses(props, colors, { className: this.class }, dark);
    const c = themeClasses(raw, theme, this.class);
    const base = c.base;
    if (typeof base === 'string') {
      this.hostClass = base;
    } else if (base && typeof base === 'object') {
      this.hostClass = (base as { default?: string }).default || '';
    } else {
      this.hostClass = '';
    }
  }
}
