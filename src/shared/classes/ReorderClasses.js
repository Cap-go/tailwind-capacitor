import { cls } from '../cls.js';

export const ReorderClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('mb-2', className),
    ios: cls('rounded-xl', colors.bgIos, colors.textIos),
    material: cls('rounded-lg', colors.bgMaterial, colors.textMaterial),
  },
});
