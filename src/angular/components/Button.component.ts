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
import { ButtonClasses } from '../../shared/classes/ButtonClasses.js';
import { ButtonColors } from '../../shared/colors/ButtonColors.js';
import { cls } from '../../shared/cls.js';
import { CAPACITOR_CONTEXT } from '../shared/capacitor-context.js';
import { resolveTheme, themeClasses } from '../shared/use-theme-classes.js';

@Component({
  selector: 'c-button',
  standalone: true,
  template:
    '<button type="button" [class]="buttonClass" [disabled]="disabled"><ng-content /></button>',
})
export class ButtonComponent implements OnInit, OnChanges, DoCheck {
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() colors?: Record<string, unknown>;
  @Input() class = '';
  @Input() outline?: boolean;
  @Input() outlineIos?: boolean;
  @Input() outlineMaterial?: boolean;
  @Input() clear?: boolean;
  @Input() clearIos?: boolean;
  @Input() clearMaterial?: boolean;
  @Input() tonal?: boolean;
  @Input() tonalIos?: boolean;
  @Input() tonalMaterial?: boolean;
  @Input() rounded?: boolean;
  @Input() roundedIos?: boolean;
  @Input() roundedMaterial?: boolean;
  @Input() small?: boolean;
  @Input() smallIos?: boolean;
  @Input() smallMaterial?: boolean;
  @Input() large?: boolean;
  @Input() largeIos?: boolean;
  @Input() largeMaterial?: boolean;
  @Input() raised?: boolean;
  @Input() raisedIos?: boolean;
  @Input() raisedMaterial?: boolean;
  @Input() inline = false;
  @Input() segmented = false;
  @Input() segmentedStrong = false;
  @Input() segmentedActive = false;
  @Input() disabled = false;

  buttonClass = '';

  @HostBinding('class')
  get hostClass(): string {
    return cls('contents', this.buttonClass);
  }

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

  private themeFlag(
    value: boolean | undefined,
    iosFallback: boolean | undefined,
    materialFallback: boolean | undefined,
  ): boolean {
    if (value !== undefined) return value;
    const theme = resolveTheme(this.ctx, this);
    return theme === 'ios' ? !!iosFallback : !!materialFallback;
  }

  private syncHostClass(): void {
    const theme = resolveTheme(this.ctx, this);
    const dark = (classNames: string) => (this.ctx.dark ? classNames : '');
    const colors = ButtonColors(this.colors || {}, dark);
    const isOutline = this.themeFlag(
      this.outline,
      this.outlineIos,
      this.outlineMaterial,
    );
    const isClear = this.themeFlag(this.clear, this.clearIos, this.clearMaterial);
    const isTonal = this.themeFlag(this.tonal, this.tonalIos, this.tonalMaterial);
    const isRounded = this.themeFlag(
      this.rounded,
      this.roundedIos,
      this.roundedMaterial,
    );
    const isSmall = this.themeFlag(this.small, this.smallIos, this.smallMaterial);
    const isLarge = this.themeFlag(this.large, this.largeIos, this.largeMaterial);
    const isRaised = this.themeFlag(this.raised, this.raisedIos, this.raisedMaterial);
    const size = isLarge ? 'large' : isSmall ? 'small' : 'medium';
    let style = isOutline
      ? 'outline'
      : isClear || (this.segmented && !this.segmentedActive)
        ? 'clear'
        : isTonal
          ? 'tonal'
          : 'fill';
    if (this.segmentedStrong && this.segmentedActive) {
      style = 'segmentedStrongActive';
    } else if (this.segmentedStrong) {
      style = 'segmentedStrong';
    }
    const props = {
      ...(this as Record<string, unknown>),
      outline: isOutline,
      clear: isClear,
      tonal: isTonal,
      rounded: isRounded,
      small: isSmall,
      large: isLarge,
      raised: isRaised,
    };
    const raw = ButtonClasses(props, colors, { className: this.class }, dark);
    const c = themeClasses(raw, theme, this.class);
    const base = c['base'] as Record<string, string> | string;
    const baseShape =
      typeof base === 'string'
        ? base
        : (base[isRounded ? 'rounded' : 'square'] as string);
    const styleClasses = (
      c['style'] as Record<string, string> | undefined
    )?.[style];
    const sizeClasses = (c['size'] as Record<string, string> | undefined)?.[
      size
    ];
    const raisedClasses = isRaised ? (c['raised'] as string) : '';
    this.buttonClass = cls(baseShape, styleClasses, sizeClasses, raisedClasses);
  }
}