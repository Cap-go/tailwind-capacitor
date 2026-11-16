import { cls } from '../cls.js';

export const AlertColors = (colorsProp = {}, dark) => ({
  bgIos: cls(
    'bg-ios-light-primary/10 border border-ios-light-primary/25',
    dark('dark:bg-ios-dark-primary/15 dark:border-ios-dark-primary/30'),
  ),
  textIos: cls('text-ios-light-primary', dark('dark:text-ios-dark-primary')),
  bgMaterial: cls(
    'bg-md-light-primary/10 border border-md-light-primary/25',
    dark('dark:bg-md-dark-primary/15 dark:border-md-dark-primary/30'),
  ),
  textMaterial: cls(
    'text-md-light-primary',
    dark('dark:text-md-dark-primary'),
  ),
  ...colorsProp,
});
