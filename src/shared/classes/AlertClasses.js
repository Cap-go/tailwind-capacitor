import { cls } from '../cls.js';

export const AlertClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('px-4 py-3 text-sm font-medium mb-2', className),
    ios: cls('rounded-xl', colors.bgIos, colors.textIos),
    material: cls('rounded-lg elevation-1', colors.bgMaterial, colors.textMaterial),
  },
});
