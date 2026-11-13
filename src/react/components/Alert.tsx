/* @ts-nocheck */
import React from 'react';
import { AlertClasses } from '../../shared/classes/AlertClasses.js';
import { AlertColors } from '../../shared/colors/AlertColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Alert = (props) => {
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
  const colors = AlertColors(colorsProp);
  const c = themeClassesFn(AlertClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Alert.displayName = 'Alert';
export default Alert;
