import { cls } from '../cls.js';

export const SegmentedColors = (colorsProp = {}, dark) => {
  return {
    strongBgIos: cls(
      'bg-neutral-200/80',
      dark('dark:bg-white/12 dark:border dark:border-white/20')
    ),
    strongBgMaterial: cls(
      'bg-md-light-surface-variant',
      dark('dark:bg-white/12 dark:border dark:border-white/20')
    ),

    borderIos: 'border-primary',
    borderMaterial: cls(
      'border-md-light-outline',
      dark('dark:border-md-dark-outline')
    ),
    divideIos: 'divide-primary',
    divideMaterial: cls(
      'divide-md-light-outline',
      dark('dark:divide-md-dark-outline')
    ),
    ...colorsProp,
  };
};
