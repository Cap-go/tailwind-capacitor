export const ItemSlidingColors = (colorsProp = {}) => ({
  bg: 'bg-light',
  text: 'text-black dark:text-white',
  iosSurface: 'ios:rounded-xl',
  materialSurface: 'android:rounded-2xl',
  ...colorsProp,
});
