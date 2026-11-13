import { cls } from '../cls.js';

export const AccordionClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('overflow-hidden', className),
    ios: cls('rounded-xl hairline', colors.bgIos),
    material: cls('rounded-2xl elevation-1', colors.bgMaterial),
  },
});
