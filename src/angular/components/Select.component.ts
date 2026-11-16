import { Component, Input } from '@angular/core';
import { ListComponent } from './List.component.js';
import { ListInputComponent } from './ListInput.component.js';

@Component({
  selector: 'c-select',
  standalone: true,
  imports: [ListComponent, ListInputComponent],
  template: `<c-list [strong]="true" [inset]="true"><c-list-input type="select" [label]="label"><ng-content /></c-list-input></c-list>`,
})
export class SelectComponent {
  @Input() label = "Select";
}
