import { Component, Input } from '@angular/core';
import { SegmentedComponent } from './Segmented.component.js';

@Component({
  selector: 'c-tabs',
  standalone: true,
  imports: [SegmentedComponent],
  template: `<c-segmented [strong]="true" [rounded]="true"><ng-content /></c-segmented>`,
})
export class TabsComponent {
  
}
