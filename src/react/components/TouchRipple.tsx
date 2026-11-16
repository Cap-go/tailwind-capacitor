// @ts-nocheck
import React from 'react';
import { TouchRippleClasses } from '../../shared/classes/TouchRippleClasses.js';
import { TouchRippleColors } from '../../shared/colors/TouchRippleColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const TouchRipple = (props) => {
  const {
    component: Component = 'div',
    className,
    colors: colorsProp,
    ios,
    material,
    children,
    ...rest
  } = props;
  const themeClassesFn = useThemeClasses({ ios, material });
  const colors = TouchRippleColors(colorsProp);
  const c = themeClassesFn(TouchRippleClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

TouchRipple.displayName = 'TouchRipple';
export default TouchRipple;
