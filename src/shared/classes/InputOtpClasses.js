import { cls } from '../cls.js';

export const InputOtpClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls(
      'flex gap-2 justify-center px-2 py-3 text-lg font-semibold tracking-widest mb-2',
      className,
    ),
    ios: cls('rounded-xl', colors.bgIos, colors.textIos),
    material: cls('rounded-lg', colors.bgMaterial, colors.textMaterial),
  },
});
