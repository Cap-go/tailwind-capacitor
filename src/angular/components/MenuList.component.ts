import { Component, Input } from '@angular/core';
import { ListComponent } from './List.component.js';

@Component({
  selector: 'c-menu-list',
  standalone: true,
  imports: [ListComponent],
  template: `<c-list [menuList]="true"><ng-content /></c-list>`,
})
export class MenuListComponent {
  
}
