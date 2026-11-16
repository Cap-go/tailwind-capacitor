export const ProgressbarClasses = (colors) => {
  return {
    base: {
      common: `block h-1 overflow-hidden rtl:rotate-180`,
      ios: `rounded-full ${colors.trackBgIos}`,
      material: colors.trackBgMaterial,
    },
    inner: {
      common: `block duration-200 w-full h-full`,
      ios: colors.bgIos,
      material: colors.bgMaterial,
    },
  };
};