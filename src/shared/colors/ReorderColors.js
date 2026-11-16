import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const ReorderColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
