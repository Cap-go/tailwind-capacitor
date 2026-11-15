// @ts-nocheck
import React from 'react';
import { AccordionClasses } from '../../shared/classes/AccordionClasses.js';
import { AccordionColors } from '../../shared/colors/AccordionColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';
import { useDarkClasses } from '../shared/use-dark-classes.js';

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
  const dark = useDarkClasses();
  const colors = AccordionColors(colorsProp, dark);
  const c = themeClassesFn(AccordionClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Accordion.displayName = 'Accordion';
export default Accordion;
