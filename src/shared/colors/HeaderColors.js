import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const HeaderColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
