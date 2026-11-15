// @ts-nocheck
import React from 'react';
import { SkeletonClasses } from '../../shared/classes/SkeletonClasses.js';
import { SkeletonColors } from '../../shared/colors/SkeletonColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';
import { useDarkClasses } from '../shared/use-dark-classes.js';

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
  const dark = useDarkClasses();
  const colors = SkeletonColors(colorsProp, dark);
  const c = themeClassesFn(SkeletonClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Skeleton.displayName = 'Skeleton';
export default Skeleton;
