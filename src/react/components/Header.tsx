// @ts-nocheck
import React from 'react';
import { HeaderClasses } from '../../shared/classes/HeaderClasses.js';
import { HeaderColors } from '../../shared/colors/HeaderColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Header = (props) => {
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
  const colors = HeaderColors(colorsProp);
  const c = themeClassesFn(HeaderClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Header.displayName = 'Header';
export default Header;
