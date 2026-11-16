import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const ModalColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
