import { cls } from '../cls.js';

export const ProgressbarColors = (colorsProp = {}, dark) => {
  return {
    bgIos: 'bg-primary',
    trackBgIos: cls('bg-black/30', dark('dark:bg-white/30')),
    bgMaterial: cls('bg-md-light-primary', dark('dark:bg-md-dark-primary')),
    trackBgMaterial: cls(
      'bg-md-light-surface-variant',
      dark('dark:bg-md-dark-surface-variant')
    ),
    ...colorsProp,
  };
};