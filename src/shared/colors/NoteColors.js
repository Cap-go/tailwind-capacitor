import { cls } from '../cls.js';

export const NoteColors = (colorsProp = {}, dark) => ({
  textIos: cls('text-ios-light-secondary', dark('dark:text-ios-dark-secondary')),
  textMaterial: cls(
    'text-md-light-secondary',
    dark('dark:text-md-dark-secondary'),
  ),
  ...colorsProp,
});
