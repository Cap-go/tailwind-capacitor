import {
  Component,
  Input,
  inject,
  OnInit,
  OnChanges,
  DoCheck,
  ChangeDetectorRef,
  HostBinding,
} from '@angular/core';
import { ItemSlidingClasses } from '../../shared/classes/ItemSlidingClasses.js';
import { ItemSlidingColors } from '../../shared/colors/ItemSlidingColors.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-item-sliding',
  standalone: true,
  template: '<ng-content />',
})
export class ItemSlidingComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  

  @HostBinding('class')
  hostClass = '';

  private readonly ctx = inject(CAPACITOR_CONTEXT);

  ngOnInit(): void {
    this.lastCtxDark = this.ctx.dark;
    this.syncHostClass();
  }

  ngOnChanges(): void {
    this.syncHostClass();
  }

  private lastCtxDark?: boolean;
  private readonly cdr = inject(ChangeDetectorRef);

  ngDoCheck(): void {
    if (this.lastCtxDark !== this.ctx.dark) {
      this.lastCtxDark = this.ctx.dark;
      this.syncHostClass();
      this.cdr.markForCheck();
    }
  }


  private syncHostClass(): void {
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    const colors = ItemSlidingColors(this.colors || {}, dark);
    const props = this as Record<string, unknown>;
    const raw = ItemSlidingClasses(props, colors, { className: this.class }, dark);
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
