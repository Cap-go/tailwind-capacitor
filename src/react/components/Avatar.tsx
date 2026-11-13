/* @ts-nocheck */
import React from 'react';
import { AvatarClasses } from '../../shared/classes/AvatarClasses.js';
import { AvatarColors } from '../../shared/colors/AvatarColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Avatar = (props) => {
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
  const colors = AvatarColors(colorsProp);
  const c = themeClassesFn(AvatarClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Avatar.displayName = 'Avatar';
export default Avatar;
