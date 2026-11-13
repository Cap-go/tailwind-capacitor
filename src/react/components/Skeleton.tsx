/* @ts-nocheck */
import React from 'react';
import { SkeletonClasses } from '../../shared/classes/SkeletonClasses.js';
import { SkeletonColors } from '../../shared/colors/SkeletonColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Skeleton = (props) => {
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
  const colors = SkeletonColors(colorsProp);
  const c = themeClassesFn(SkeletonClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Skeleton.displayName = 'Skeleton';
export default Skeleton;
