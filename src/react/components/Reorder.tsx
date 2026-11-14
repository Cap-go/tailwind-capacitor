// @ts-nocheck
import React from 'react';
import { ReorderClasses } from '../../shared/classes/ReorderClasses.js';
import { ReorderColors } from '../../shared/colors/ReorderColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Reorder = (props) => {
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
  const colors = ReorderColors(colorsProp);
  const c = themeClassesFn(ReorderClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Reorder.displayName = 'Reorder';
export default Reorder;
