import {
  Component,
  Input,
  inject,
  OnInit,
  OnChanges,
  HostBinding,
} from '@angular/core';
import { SkeletonClasses } from '../../shared/classes/SkeletonClasses.js';
import { SkeletonColors } from '../../shared/colors/SkeletonColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-skeleton',
  standalone: true,
  template: '<ng-content />',
})
export class SkeletonComponent implements OnInit, OnChanges {
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
    const colors = SkeletonColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = SkeletonClasses(props, colors, { className: this.class }, dark);
    const c = themeClasses(raw, theme, this.class);
    const base = c['base'];
    if (typeof base === 'string') {
      this.hostClass = base;
    } else if (base && typeof base === 'object') {
      const baseRecord = base as Record<string, unknown>;
      const d = baseRecord['default'];
      this.hostClass = typeof d === 'string' ? d : '';
    } else {
      this.hostClass = '';
    }
  }
}
