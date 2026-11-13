import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const SplitPaneColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
