// @ts-nocheck
import React from 'react';
import { CapacitorContext } from './CapacitorContext.js';
import { useAutoTheme } from './use-auto-theme.js';
import { useEffectiveDark } from './use-effective-dark.js';

const TailwindCapacitorProvider = (props) => {
  const {
    theme,
    dark,
    touchRipple = true,
    autoThemeDetection = true,
    children,
  } = props;

  const currentTheme = useAutoTheme(theme, autoThemeDetection);
  const effectiveDark = useEffectiveDark(dark);

  return (
    <div
      className={
        effectiveDark ? 'dark min-h-full w-full' : 'min-h-full w-full'
      }
    >
      <CapacitorContext.Provider
        value={{
          theme: currentTheme,
          dark: effectiveDark,
          touchRipple,
        }}
      >
        {children}
      </CapacitorContext.Provider>
    </div>
  );
};

export { TailwindCapacitorProvider };
