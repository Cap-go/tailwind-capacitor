export const ProgressbarClasses = (colors) => {
  return {
    base: {
      common: `block h-1 bg-black/30 dark:bg-white/30 overflow-hidden rtl:rotate-180`,
      ios: `rounded-full`,
      material: colors.bgMaterial,
    },
    inner: {
      common: `block duration-200 w-full h-full`,
      ios: colors.bgIos,
      material: colors.bgMaterial,
    },
  };
};
