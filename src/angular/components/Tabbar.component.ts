import { Component, Input } from '@angular/core';
import { ToolbarComponent } from './Toolbar.component.js';

@Component({
  selector: 'c-tabbar',
  standalone: true,
  imports: [ToolbarComponent],
  template: `<c-toolbar [tabbar]="true"><ng-content /></c-toolbar>`,
})
export class TabbarComponent {
  
}
