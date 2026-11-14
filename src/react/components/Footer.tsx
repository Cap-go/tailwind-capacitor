// @ts-nocheck
import React from 'react';
import { FooterClasses } from '../../shared/classes/FooterClasses.js';
import { FooterColors } from '../../shared/colors/FooterColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Footer = (props) => {
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
  const colors = FooterColors(colorsProp);
  const c = themeClassesFn(FooterClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Footer.displayName = 'Footer';
export default Footer;
