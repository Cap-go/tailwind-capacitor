import { cls } from '../cls.js';

export const SkeletonClasses = (props, colors, { className } = {}) => ({
  base: {
    common: cls(
      'animate-pulse rounded',
      colors.block,
      className,
    ),
    ios: 'rounded-lg',
    material: 'rounded-md',
  },
});
