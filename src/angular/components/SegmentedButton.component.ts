import { Component, Input } from '@angular/core';
import { ButtonComponent } from './Button.component.js';

@Component({
  selector: 'c-segmented-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `<c-button [segmented]="true" [segmentedStrong]="strong" [rounded]="rounded" [segmentedActive]="active"><ng-content /></c-button>`,
})
export class SegmentedButtonComponent {
  @Input() strong = false;
  @Input() rounded = false;
  @Input() active = false;
}
