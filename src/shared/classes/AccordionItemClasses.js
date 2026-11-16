import { cls } from '../cls.js';

export const AccordionItemClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls(
      'flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium cursor-pointer',
      className,
    ),
    ios: cls('hairline-b last:hairline-b-0', colors.textIos, colors.activeIos),
    material: cls(colors.textMaterial, colors.activeMaterial),
  },
  chevron: {
    common: 'opacity-40 ms-2 shrink-0',
    ios: 'w-2 h-2',
    material: 'w-2 h-2',
  },
});
