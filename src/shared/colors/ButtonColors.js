import { cls } from '../cls.js';

/**
 * Literal utility strings for Tailwind v4 source scanning. Custom tonalBgIos
 * overrides still need tonalActiveBgIos or the same active:* token in a scanned file.
 */
/** @see registry/capacitor/styles/tonal-active-scan.css (generated; full palette). */
export const tonalActiveBgIosScanHints =
  'active:!bg-primary/25 active:!bg-pink-500/25 active:!bg-lime-500/25';

function tonalActiveFromBg(tonalBgIos) {
  const token = String(tonalBgIos)
    .trim()
    .split(/\s+/)
    .find((part) => part.startsWith('bg-'));
  if (!token) return 'active:!bg-primary/25';
  const slash = token.match(/^bg-(.+)\/(\d+)$/);
  if (slash) {
    const opacity = Math.min(
      100,
      Math.round((Number(slash[2]) * 25) / 15),
    );
    return `active:!bg-${slash[1]}/${opacity}`;
  }
  if (token.includes('/[')) {
    return 'active:!bg-primary/25';
  }
  const bracket = token.match(/^bg-(\[[^\]]+\])$/);
  if (bracket) return `active:!bg-${bracket[1]}/25`;
  const solid = token.match(/^bg-([a-zA-Z0-9-]+)$/);
  if (solid) return `active:!bg-${solid[1]}/25`;
  return 'active:!bg-primary/25';
}

export const ButtonColors = (colorsProp = {}, dark) => {
  const defaults = {
    activeBgIos: 'active:bg-primary/15',
    activeBgMaterial: '',
    textIos: 'text-primary',
    textMaterial: cls('text-md-light-primary', 'dark:text-md-dark-primary'),
    fillTextIos: cls('text-white'),
    fillTextMaterial: cls(
      'text-md-light-on-primary',
      dark('dark:text-md-dark-on-primary')
    ),
    fillActiveBgIos: 'active:bg-ios-primary-shade',
    fillActiveBgMaterial: '',
    fillBgIos: 'bg-primary',
    fillBgMaterial: cls('bg-md-light-primary', dark('dark:bg-md-dark-primary')),
    fillTouchRipple: cls('touch-ripple-white', 'dark:touch-ripple-primary'),
    outlineBorderIos: 'border-primary',
    outlineBorderMaterial: cls(
      'border-md-light-outline',
      dark('dark:border-md-dark-outline')
    ),
    tonalBgIos: 'bg-primary/15',
    tonalActiveBgIos: 'active:!bg-primary/25',
    tonalBgMaterial: cls(
      'bg-md-light-secondary-container',
      dark('dark:bg-md-dark-secondary-container')
    ),
    tonalTextIos: 'text-primary',
    tonalTextMaterial: cls(
      'text-md-light-on-secondary-container',
      dark('dark:text-md-dark-on-secondary-container')
    ),
    touchRipple: 'touch-ripple-primary',
    disabledText: cls(
      'text-black/30',
      dark('dark:text-white/30')
    ),
    disabledBg: cls(
      'bg-black/10',
      dark('dark:bg-white/10')
    ),
    disabledBorder: cls(
      'border-black/10',
      dark('dark:border-white/10')
    ),
  };
  const merged = { ...defaults, ...colorsProp };
  if (
    Object.prototype.hasOwnProperty.call(colorsProp, 'tonalBgIos') &&
    !Object.prototype.hasOwnProperty.call(colorsProp, 'tonalActiveBgIos')
  ) {
    merged.tonalActiveBgIos = tonalActiveFromBg(colorsProp.tonalBgIos);
  }
  return merged;
};