/* @ts-nocheck */
import React from 'react';
import { TabsClasses } from '../../shared/classes/TabsClasses.js';
import { TabsColors } from '../../shared/colors/TabsColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Tabs = (props) => {
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
  const colors = TabsColors(colorsProp);
  const c = themeClassesFn(TabsClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Tabs.displayName = 'Tabs';
export default Tabs;
