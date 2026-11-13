import {
  Component,
  Input,
  inject,
  OnInit,
  OnChanges,
  HostBinding,
} from '@angular/core';
import { ProgressbarClasses } from '../../shared/classes/ProgressbarClasses.js';
import { ProgressbarColors } from '../../shared/colors/ProgressbarColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-progressbar',
  standalone: true,
  template: '<ng-content />',
})
export class ProgressbarComponent implements OnInit, OnChanges {
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
    const colors = ProgressbarColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = ProgressbarClasses(props, colors, { className: this.class }, dark);
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
