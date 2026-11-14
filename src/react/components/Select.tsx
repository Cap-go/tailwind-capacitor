// @ts-nocheck
import React from 'react';
import { SelectClasses } from '../../shared/classes/SelectClasses.js';
import { SelectColors } from '../../shared/colors/SelectColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Select = (props) => {
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
  const colors = SelectColors(colorsProp);
  const c = themeClassesFn(SelectClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Select.displayName = 'Select';
export default Select;
