import { cls } from '../cls.js';

export const NoteClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls('text-xs uppercase font-medium tracking-wide px-4', className),
    ios: cls(colors.textIos),
    material: cls(colors.textMaterial),
  },
});
