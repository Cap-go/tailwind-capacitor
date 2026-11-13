import { Component, Input } from '@angular/core';
import { ListComponent } from './List.component.js';

@Component({
  selector: 'c-list-group',
  standalone: true,
  imports: [ListComponent],
  template: `<c-list [nested]="true"><ng-content /></c-list>`,
})
export class ListGroupComponent {
  
}
