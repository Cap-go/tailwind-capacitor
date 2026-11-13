import {
  Component,
  Input,
  inject,
  OnChanges,
  HostBinding,
} from '@angular/core';
import { ButtonClasses } from '../../shared/classes/ButtonClasses.js';
import { ButtonColors } from '../../shared/colors/ButtonColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-button',
  standalone: true,
  template: '<ng-content />',
})
export class ButtonComponent implements OnChanges {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnChanges(): void {
    const theme = resolveTheme(this.ctx, this);
    const colors = ButtonColors(this.colors || {});
    const props = this as Record<string, unknown>;
    const raw = ButtonClasses(props, colors, { className: this.class });
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
