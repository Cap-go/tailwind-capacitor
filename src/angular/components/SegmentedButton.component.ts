import { Component, Input } from '@angular/core';
import { ButtonComponent } from './Button.component.js';

@Component({
  selector: 'c-segmented-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `<c-button [segmented]="true"><ng-content /></c-button>`,
})
export class SegmentedButtonComponent {
  
}
