// @ts-nocheck
import React from 'react';
import { DatetimeClasses } from '../../shared/classes/DatetimeClasses.js';
import { DatetimeColors } from '../../shared/colors/DatetimeColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';
import { useDarkClasses } from '../shared/use-dark-classes.js';

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
  const dark = useDarkClasses();
  const colors = DatetimeColors(colorsProp, dark);
  const c = themeClassesFn(DatetimeClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Datetime.displayName = 'Datetime';
export default Datetime;
