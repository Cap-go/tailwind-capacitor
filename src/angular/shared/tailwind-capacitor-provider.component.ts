import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CAPACITOR_CONTEXT } from './capacitor-context.js';

@Component({
  selector: 'tailwind-capacitor-provider',
  standalone: true,
  template:
    '<div class="min-h-full w-full" [class.dark]="effectiveDark"><ng-content /></div>',
  providers: [
    {
      provide: CAPACITOR_CONTEXT,
      useFactory: (parent: TailwindCapacitorProviderComponent) => ({
        theme: parent.theme,
        dark: parent.effectiveDark,
        touchRipple: parent.touchRipple,
      }),
      deps: [TailwindCapacitorProviderComponent],
    },
  ],
})
export class TailwindCapacitorProviderComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() theme: 'ios' | 'material' = 'material';
  @Input() dark?: boolean;
  @Input() touchRipple = true;

  effectiveDark = false;

  private media?: MediaQueryList;
  private onSchemeChange?: () => void;

  ngOnInit(): void {
    this.refreshEffectiveDark();
    if (this.dark === undefined && typeof window !== 'undefined') {
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
      this.effectiveDark = this.media.matches;
      this.onSchemeChange = () => {
        if (this.dark === undefined && this.media) {
          this.effectiveDark = this.media.matches;
        }
      };
      this.media.addEventListener('change', this.onSchemeChange);
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.refreshEffectiveDark();
  }

  ngOnDestroy(): void {
    if (this.media && this.onSchemeChange) {
      this.media.removeEventListener('change', this.onSchemeChange);
    }
  }

  private refreshEffectiveDark(): void {
    if (this.dark !== undefined) {
      this.effectiveDark = this.dark;
    }
  }
}
