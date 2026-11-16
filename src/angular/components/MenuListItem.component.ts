import { Component, Input } from '@angular/core';
import { ListItemComponent } from './ListItem.component.js';

@Component({
  selector: 'c-menu-list-item',
  standalone: true,
  imports: [ListItemComponent],
  template: `<c-list-item [menuListItem]="true"><ng-content /></c-list-item>`,
})
export class MenuListItemComponent {
  
}
