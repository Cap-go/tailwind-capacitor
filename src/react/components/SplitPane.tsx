/* @ts-nocheck */
import React from 'react';
import { SplitPaneClasses } from '../../shared/classes/SplitPaneClasses.js';
import { SplitPaneColors } from '../../shared/colors/SplitPaneColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const SplitPane = (props) => {
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
  const colors = SplitPaneColors(colorsProp);
  const c = themeClassesFn(SplitPaneClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

SplitPane.displayName = 'SplitPane';
export default SplitPane;
