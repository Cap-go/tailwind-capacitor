// @ts-nocheck
import React from 'react';
import { ThumbnailClasses } from '../../shared/classes/ThumbnailClasses.js';
import { ThumbnailColors } from '../../shared/colors/ThumbnailColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Thumbnail = (props) => {
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
  const colors = ThumbnailColors(colorsProp);
  const c = themeClassesFn(ThumbnailClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Thumbnail.displayName = 'Thumbnail';
export default Thumbnail;
