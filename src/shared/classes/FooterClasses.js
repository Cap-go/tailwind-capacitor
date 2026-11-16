import { cls } from '../cls.js';

export const FooterClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('block', className),
    ios: cls(colors.bgIos, colors.textIos),
    material: cls(colors.bgMaterial, colors.textMaterial),
  },
});
