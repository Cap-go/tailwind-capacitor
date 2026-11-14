import {
  Component,
  Input,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  ApplicationRef,
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
      useFactory: () => {
        const parent = inject(TailwindCapacitorProviderComponent);
        return {
          get theme() {
            return parent.theme;
          },
          get dark() {
            return parent.effectiveDark;
          },
          get touchRipple() {
            return parent.touchRipple;
          },
        };
      },
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

  private readonly appRef = inject(ApplicationRef);
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
    this.appRef.tick();
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
