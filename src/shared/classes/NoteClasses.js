import { cls } from '../cls.js';

export const NoteClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls(colors.bg, colors.text, className),
    ios: colors.iosSurface,
    material: colors.materialSurface,
  },
});
