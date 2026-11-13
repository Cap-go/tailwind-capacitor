/* @ts-nocheck */
import React from 'react';
import { AccordionClasses } from '../../shared/classes/AccordionClasses.js';
import { AccordionColors } from '../../shared/colors/AccordionColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Accordion = (props) => {
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
  const colors = AccordionColors(colorsProp);
  const c = themeClassesFn(AccordionClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Accordion.displayName = 'Accordion';
export default Accordion;
