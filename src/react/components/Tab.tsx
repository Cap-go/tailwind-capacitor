/* @ts-nocheck */
import React from 'react';
import { TabClasses } from '../../shared/classes/TabClasses.js';
import { TabColors } from '../../shared/colors/TabColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Tab = (props) => {
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
  const colors = TabColors(colorsProp);
  const c = themeClassesFn(TabClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Tab.displayName = 'Tab';
export default Tab;
