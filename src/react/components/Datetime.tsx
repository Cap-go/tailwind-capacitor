// @ts-nocheck
import React from 'react';
import { DatetimeClasses } from '../../shared/classes/DatetimeClasses.js';
import { DatetimeColors } from '../../shared/colors/DatetimeColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Datetime = (props) => {
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
  const colors = DatetimeColors(colorsProp);
  const c = themeClassesFn(DatetimeClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Datetime.displayName = 'Datetime';
export default Datetime;
