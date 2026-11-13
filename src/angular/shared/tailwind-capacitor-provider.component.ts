import { Component, Input } from '@angular/core';
import { CAPACITOR_CONTEXT } from './capacitor-context.js';

@Component({
  selector: 'tailwind-capacitor-provider',
  standalone: true,
  template: '<ng-content />',
  providers: [
    {
      provide: CAPACITOR_CONTEXT,
      useFactory: (parent: TailwindCapacitorProviderComponent) => ({
        theme: parent.theme,
        dark: parent.dark,
        touchRipple: parent.touchRipple,
      }),
      deps: [TailwindCapacitorProviderComponent],
    },
  ],
})
export class TailwindCapacitorProviderComponent {
  @Input() theme: 'ios' | 'material' = 'material';
  @Input() dark = true;
  @Input() touchRipple = true;
}
