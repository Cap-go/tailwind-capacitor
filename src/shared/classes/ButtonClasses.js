import { positionClass } from '../position-class.js';
import { cls } from '../cls.js';

export const ButtonClasses = (props, colors, classes, darkClasses) => {
  const { inline, segmented, segmentedStrong, segmentedActive, disabled } =
    props;
  return {
    base: {
      common: cls(
        'flex text-center justify-center items-center appearance-none py-1 transition-colors focus:outline-none cursor-pointer select-none overflow-hidden z-10',
        inline ? 'inline-flex' : 'w-full flex',
        positionClass('relative', classes),
        disabled && 'pointer-events-none',
        segmentedStrong && segmentedActive && 'c-segmented-strong-button-active'
      ),
      ios: `uppercase duration-100 font-semibold px-2`,
      material: `duration-300 font-medium px-4`,

      square: {
        ios:
          segmented && !segmentedStrong
            ? 'first:rounded-s last:rounded-e'
            : 'rounded',
        material:
          segmented && !segmentedStrong
            ? 'first:rounded-lg-s last:rounded-lg-e'
            : 'rounded-lg',
      },

      rounded: segmented && !segmentedStrong ? '' : 'rounded-full',
    },
    style: {
      fill: {
        common: cls(disabled && cls(colors.disabledBg, colors.disabledText)),
        ios: cls(
          disabled
            ? cls(colors.disabledBg, colors.disabledText)
            : `${colors.fillTextIos} ${colors.fillBgIos} ${colors.fillActiveBgIos}`
        ),
        material: cls(
          disabled
            ? cls(colors.disabledBg, colors.disabledText)
            : cls(
                colors.fillTextMaterial,
                colors.fillBgMaterial,
                colors.fillActiveBgMaterial,
                colors.fillTouchRipple
              )
        ),
      },
      outline: {
        common: cls(
          disabled
            ? cls(colors.disabledText, colors.disabledBorder)
            : cls('active:bg-opacity-15', colors.touchRipple)
        ),
        ios: cls(
          !segmented && 'border-2',
          !disabled && !segmented && colors.outlineBorderIos,
          !disabled && cls(colors.textIos, colors.activeBgIos)
        ),
        material: cls(
          !segmented && 'border',
          !disabled && !segmented && colors.outlineBorderMaterial,
          !disabled && cls(colors.textMaterial, colors.activeBgMaterial)
        ),
      },
      clear: {
        common: cls(
          disabled
            ? colors.disabledText
            : `active:bg-opacity-15 ${colors.touchRipple}`
        ),
        ios: !disabled && cls(colors.textIos, colors.activeBgIos),
        material:
          !disabled && cls(colors.textMaterial, colors.activeBgMaterial),
      },
      tonal: {
        common: disabled
          ? cls(colors.disabledBg, colors.disabledText)
          : cls(colors.touchRipple),
        ios:
          !disabled &&
          cls(
            colors.tonalTextIos,
            colors.tonalBgIos,
            colors.activeBgIos,
            'bg-opacity-15 active:bg-opacity-25'
          ),
        material:
          !disabled &&
          cls(
            colors.tonalTextMaterial,
            colors.tonalBgMaterial,
            colors.activeBgMaterial
          ),
      },
      segmentedStrong: {
        common: cls(
          '!bg-transparent shadow-none text-primary relative z-0',
          darkClasses('dark:text-white/55'),
          `active:bg-black active:bg-opacity-10`,
          darkClasses(
            'dark:active:bg-white dark:active:bg-opacity-10 dark:touch-ripple-white'
          ),
          colors.touchRipple
        ),
        ios: cls(
          !disabled && colors.textIos,
          darkClasses('dark:text-white/55')
        ),
        material: cls(
          !disabled && colors.textMaterial,
          darkClasses('dark:text-white/55')
        ),
      },
      segmentedStrongActive: {
        common: 'duration-0 relative z-10 bg-transparent shadow-none',
        ios: cls(
          !disabled && 'text-black',
          darkClasses('dark:text-white')
        ),
        material: cls(
          !disabled && 'text-black',
          darkClasses('dark:text-white')
        ),
      },
    },
    size: {
      small: {
        ios: `text-xs h-7`,
        material: `text-sm h-8`,
      },
      medium: {
        common: 'text-sm',
        ios: `h-7`,
        material: `h-10`,
      },
      large: {
        ios: `h-11`,
        material: `h-12`,
      },
    },
    raised: `shadow active:shadow-lg`,
  };
};
