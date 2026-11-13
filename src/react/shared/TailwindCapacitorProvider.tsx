/* @ts-nocheck */
import React from 'react';
import { CapacitorContext } from './CapacitorContext.js';
import { useAutoTheme } from './use-auto-theme.js';

const TailwindCapacitorProvider = (props) => {
  const {
    theme,
    dark,
    touchRipple = true,
    autoThemeDetection = true,
    children,
  } = props;

  const currentTheme = useAutoTheme(theme, autoThemeDetection);

  return (
    <CapacitorContext.Provider
      value={{
        theme: currentTheme,
        dark,
        touchRipple,
      }}
    >
      {children}
    </CapacitorContext.Provider>
  );
};

export { TailwindCapacitorProvider };
