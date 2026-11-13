import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const InputOtpColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
