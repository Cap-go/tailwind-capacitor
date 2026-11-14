import { cls } from '../cls.js';

export const ThumbnailClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls(
      'overflow-hidden flex items-center justify-center text-xs font-medium shrink-0',
      className,
    ),
    ios: cls('w-14 h-14 rounded-lg', colors.bgIos, colors.textIos),
    material: cls('w-12 h-12 rounded-md', colors.bgMaterial, colors.textMaterial),
  },
});
