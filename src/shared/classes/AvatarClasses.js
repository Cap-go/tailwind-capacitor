import { cls } from '../cls.js';

export const AvatarClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls(
      'inline-flex items-center justify-center font-semibold shrink-0 select-none',
      className,
    ),
    ios: cls('w-12 h-12 text-base rounded-full', colors.bgIos, colors.textIos),
    material: cls(
      'w-10 h-10 text-sm rounded-full',
      colors.bgMaterial,
      colors.textMaterial,
    ),
  },
});
