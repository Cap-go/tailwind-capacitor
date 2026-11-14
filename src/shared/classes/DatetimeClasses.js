import { cls } from '../cls.js';

export const DatetimeClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('px-4 py-3 text-sm mb-2', className),
    ios: cls('rounded-xl', colors.bgIos, colors.textIos),
    material: cls('rounded-lg', colors.bgMaterial, colors.textMaterial),
  },
});
