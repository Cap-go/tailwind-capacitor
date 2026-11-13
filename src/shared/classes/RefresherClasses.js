import { cls } from '../cls.js';

export const RefresherClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('px-4 py-2 text-xs text-center mb-2', className),
    ios: cls('rounded-lg', colors.bgIos, colors.textIos),
    material: cls('rounded-lg', colors.bgMaterial, colors.textMaterial),
  },
});
