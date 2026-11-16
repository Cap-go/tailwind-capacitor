import { cls } from '../cls.js';

export const SkeletonColors = (colorsProp = {}, dark) => ({
  block: cls(
    'bg-ios-light-surface-1-shade',
    dark('dark:bg-ios-dark-surface-1-shade'),
    'android:bg-md-light-surface-1-shade',
    dark('dark:android:bg-md-dark-surface-1-shade'),
  ),
  ...colorsProp,
});
