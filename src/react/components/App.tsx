// @ts-nocheck
import React, { useRef } from 'react';
import { TailwindCapacitorProvider } from '../shared/TailwindCapacitorProvider.tsx';
import { useAutoTheme } from '../shared/use-auto-theme.js';
import { AppClasses } from '../../shared/classes/AppClasses.js';

const App = (props) => {
  const {
    component = 'div',
    className,

    theme = 'material',
    dark = true,
    touchRipple = true,
    touchHighlight = true,
    safeAreas = true,

    ref,

    // Children
    children,

    // Rest
    ...rest
  } = props;

  const elRef = useRef(null);

  const Component = component;

  const attrs = {
    ...rest,
  };

  const currentTheme = useAutoTheme(theme);

  const classes = AppClasses({ ...props, safeAreas }, currentTheme, className);

  return (
    <TailwindCapacitorProvider
      theme={currentTheme}
      dark={dark}
      touchRipple={touchRipple}
      touchHighlight={touchHighlight}
      autoThemeDetection={false}
    >
      <Component
        ref={(el) => {
          elRef.current = el;
          if (ref && typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        className={classes}
        {...attrs}
      >
        {children}
      </Component>
    </TailwindCapacitorProvider>
  );
};

App.displayName = 'App';

export default App;
