import { cls } from '../cls.js';

export const ThumbnailColors = (colorsProp = {}, dark) => ({
  bgIos: cls('bg-ios-light-surface-1-shade', dark('dark:bg-ios-dark-surface-1-shade')),
  textIos: cls('text-ios-light-secondary', dark('dark:text-ios-dark-secondary')),
  bgMaterial: cls('bg-md-light-surface-1-shade', dark('dark:bg-md-dark-surface-1-shade')),
  textMaterial: cls(
    'text-md-light-secondary',
    dark('dark:text-md-dark-secondary'),
  ),
  ...colorsProp,
});
