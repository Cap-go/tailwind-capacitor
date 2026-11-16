import { ionicSurfaceColors } from './ionicSurfaceColors.js';

export const PickerColors = (colorsProp = {}, dark) => ({
  ...ionicSurfaceColors(dark),
  ...colorsProp,
});
