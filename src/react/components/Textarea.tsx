// @ts-nocheck
import React from 'react';
import { TextareaClasses } from '../../shared/classes/TextareaClasses.js';
import { TextareaColors } from '../../shared/colors/TextareaColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Textarea = (props) => {
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
  const colors = TextareaColors(colorsProp);
  const c = themeClassesFn(TextareaClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Textarea.displayName = 'Textarea';
export default Textarea;
