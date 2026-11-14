import { cls } from '../cls.js';

export const AccordionColors = (colorsProp = {}, dark) => ({
  bgIos: cls('bg-ios-light-surface-1', dark('dark:bg-ios-dark-surface-1')),
  bgMaterial: cls('bg-md-light-surface-1', dark('dark:bg-md-dark-surface-1')),
  ...colorsProp,
});
