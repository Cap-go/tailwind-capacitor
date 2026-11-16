import { Component, Input } from '@angular/core';
import { SegmentedButtonComponent } from './SegmentedButton.component.js';

@Component({
  selector: 'c-tab',
  standalone: true,
  imports: [SegmentedButtonComponent],
  template: `<c-segmented-button [strong]="true" [rounded]="true" [active]="active"><ng-content /></c-segmented-button>`,
})
export class TabComponent {
  @Input() active = false;
}
