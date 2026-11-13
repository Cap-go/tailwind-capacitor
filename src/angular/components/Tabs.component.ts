import {
  Component,
  Input,
  inject,
  OnChanges,
  HostBinding,
} from '@angular/core';
import { TabsClasses } from '../../shared/classes/TabsClasses.js';
import { TabsColors } from '../../shared/colors/TabsColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-tabs',
  standalone: true,
  template: '<ng-content />',
})
export class TabsComponent implements OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnChanges(): void {
    const theme = resolveTheme(this.ctx, this);
    const colors = TabsColors(this.colors || {});
    const props = this as Record<string, unknown>;
    const raw = TabsClasses(props, colors, { className: this.class });
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
