import { Component, Input } from '@angular/core';
import { ListComponent } from './List.component.js';
import { ListInputComponent } from './ListInput.component.js';

@Component({
  selector: 'c-textarea',
  standalone: true,
  imports: [ListComponent, ListInputComponent],
  template: `<c-list [strong]="true" [inset]="true"><c-list-input type="textarea" [label]="label" [placeholder]="placeholder" /></c-list>`,
})
export class TextareaComponent {
  @Input() label = "Notes";
  @Input() placeholder = "";
}
