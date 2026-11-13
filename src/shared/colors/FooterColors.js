import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const FooterColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
