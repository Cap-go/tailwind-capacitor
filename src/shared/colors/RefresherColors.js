import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const RefresherColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
