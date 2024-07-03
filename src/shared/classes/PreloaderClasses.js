import { cls } from '../cls.js';

export const PreloaderClasses = (props, colors, theme) => {
  const { size } = props;
  return {
    base: {
      common: cls(
        theme === 'ios' ? 'c-ios-preloader' : 'c-material-preloader',
        `inline-block ${size}`
      ),
      ios: colors.iconIos,
      material: `stroke-4 ${colors.iconMaterial}`,
    },
    inner: {
      common: `block w-full h-full`,
    },
  };
};
