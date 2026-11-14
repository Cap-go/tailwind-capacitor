import { Component, Input } from '@angular/core';

@Component({
  selector: 'c-dropdown-icon',
  standalone: true,
  template: `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="8"
    height="5"
    viewBox="0 0 8 5"
    fill="currentcolor"
  >
    <polygon fillRule="evenodd" points="0 0 8 0 4 5" />
  </svg>`,
})
export class DropdownIconComponent {
  @Input() theme?: 'ios' | 'material';
  @Input() ios?: boolean;
  @Input() material?: boolean;
  @Input() fill?: string;

  resolveTheme(): 'ios' | 'material' {
    if (this.ios) return 'ios';
    if (this.material) return 'material';
    if (this.theme === 'ios' || this.theme === 'material') return this.theme;
    return 'material';
  }
}
