// @ts-nocheck
import React from 'react';
import { InfiniteScrollClasses } from '../../shared/classes/InfiniteScrollClasses.js';
import { InfiniteScrollColors } from '../../shared/colors/InfiniteScrollColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const InfiniteScroll = (props) => {
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
  const colors = InfiniteScrollColors(colorsProp);
  const c = themeClassesFn(InfiniteScrollClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

InfiniteScroll.displayName = 'InfiniteScroll';
export default InfiniteScroll;
