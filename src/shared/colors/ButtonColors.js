import { cls } from '../cls.js';

function tonalActiveFromBg(tonalBgIos) {
  const token = String(tonalBgIos)
    .trim()
    .split(/\s+/)
    .find((part) => part.startsWith('bg-'));
  if (!token) return 'active:bg-primary/25';
  const slash = token.match(/^bg-(.+)\/(\d+)$/);
  if (slash) {
    const opacity = Math.min(
      100,
      Math.round((Number(slash[2]) * 25) / 15),
    );
    return `active:bg-${slash[1]}/${opacity}`;
  }
  const solid = token.match(/^bg-(.+)$/);
  if (solid) return `active:bg-${solid[1]}/25`;
  return 'active:bg-primary/25';
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
    tonalActiveBgIos: 'active:bg-primary/25',
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