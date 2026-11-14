// @ts-nocheck
import React from 'react';
import { RefresherClasses } from '../../shared/classes/RefresherClasses.js';
import { RefresherColors } from '../../shared/colors/RefresherColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Refresher = (props) => {
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
  const colors = RefresherColors(colorsProp);
  const c = themeClassesFn(RefresherClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Refresher.displayName = 'Refresher';
export default Refresher;
