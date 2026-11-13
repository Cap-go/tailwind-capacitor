import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const ItemSlidingColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
