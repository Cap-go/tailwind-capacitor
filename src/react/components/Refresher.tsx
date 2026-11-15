// @ts-nocheck
import React from 'react';
import { RefresherClasses } from '../../shared/classes/RefresherClasses.js';
import { RefresherColors } from '../../shared/colors/RefresherColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';
import { useDarkClasses } from '../shared/use-dark-classes.js';

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
  const dark = useDarkClasses();
  const colors = RefresherColors(colorsProp, dark);
  const c = themeClassesFn(RefresherClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Refresher.displayName = 'Refresher';
export default Refresher;
