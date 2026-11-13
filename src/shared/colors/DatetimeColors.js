import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const DatetimeColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
