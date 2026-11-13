import {
  Component,
  Input,
  inject,
  OnChanges,
  HostBinding,
} from '@angular/core';
import { RangeClasses } from '../../shared/classes/RangeClasses.js';
import { RangeColors } from '../../shared/colors/RangeColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-range',
  standalone: true,
  template: '<ng-content />',
})
export class RangeComponent implements OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnChanges(): void {
    const theme = resolveTheme(this.ctx, this);
    const colors = RangeColors(this.colors || {});
    const props = this as Record<string, unknown>;
    const raw = RangeClasses(props, colors, { className: this.class });
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
