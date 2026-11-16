import { cls } from '../cls.js';

/** Shared list/surface tokens for Ionic-style blocks in the demo and scaffolds. */
export const ionicSurfaceColors = (dark, extra = {}) => ({
  bgIos: cls(
    'bg-ios-light-surface-1 border border-black/10',
    dark('dark:bg-ios-dark-surface-1 dark:border-white/10'),
  ),
  textIos: cls('text-ios-light-label', dark('dark:text-ios-dark-label')),
  bgMaterial: cls(
    'bg-md-light-surface-2 border border-md-light-outline',
    dark('dark:bg-md-dark-surface-2 dark:border-md-dark-outline'),
  ),
  textMaterial: cls(
    'text-md-light-on-surface',
    dark('dark:text-md-dark-on-surface'),
  ),
  ...extra,
});
