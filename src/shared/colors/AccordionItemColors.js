import { cls } from '../cls.js';

export const AccordionItemColors = (colorsProp = {}, dark) => ({
  textIos: cls('text-ios-light-primary', dark('dark:text-ios-dark-primary')),
  activeIos: cls('active:bg-ios-light-surface-1-shade', dark('dark:active:bg-ios-dark-surface-1-shade')),
  textMaterial: cls(
    'text-md-light-primary',
    dark('dark:text-md-dark-primary'),
  ),
  activeMaterial: cls(
    'active:bg-md-light-surface-1-shade',
    dark('dark:active:bg-md-dark-surface-1-shade'),
  ),
  ...colorsProp,
});
