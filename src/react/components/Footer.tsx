// @ts-nocheck
import React from 'react';
import { FooterClasses } from '../../shared/classes/FooterClasses.js';
import { FooterColors } from '../../shared/colors/FooterColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';
import { useDarkClasses } from '../shared/use-dark-classes.js';

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
  const dark = useDarkClasses();
  const colors = FooterColors(colorsProp, dark);
  const c = themeClassesFn(FooterClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Footer.displayName = 'Footer';
export default Footer;
