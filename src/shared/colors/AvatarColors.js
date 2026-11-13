import { cls } from '../cls.js';

export const AvatarColors = (colorsProp = {}, dark) => ({
  bgIos: cls('bg-primary', dark('dark:bg-primary')),
  textIos: 'text-white',
  bgMaterial: cls('bg-primary', dark('dark:bg-primary')),
  textMaterial: 'text-white',
  ...colorsProp,
});
