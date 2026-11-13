import { cls } from '../cls.js';

export const SplitPaneClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('flex gap-2 min-h-16 mb-2 text-sm', className),
    ios: colors.textIos,
    material: colors.textMaterial,
  },
});
