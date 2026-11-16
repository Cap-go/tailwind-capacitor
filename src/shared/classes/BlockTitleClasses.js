import { cls } from '../cls.js';

export const BlockTitleClasses = (props, colors) => {
  const { withBlock, medium, large } = props;
  return {
    base: {
      common: withBlock
        ? 'pl-4-safe pr-4-safe mt-8 -mb-6 flex justify-between items-center'
        : 'block w-full mb-3 mt-0',
      ios: cls(
        `font-semibold ${colors.textIos}`,
        large && 'text-[1.5rem]',
        medium && 'text-[1.125rem]',
        !medium && !large && 'text-[1rem]'
      ),
      material: cls(
        `font-medium ${colors.textMaterial}`,
        large && 'text-[1.375rem]',
        medium && 'text-[1rem]',
        !medium && !large && 'text-[0.875rem]'
      ),
    },
  };
};
