import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const InfiniteScrollColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
