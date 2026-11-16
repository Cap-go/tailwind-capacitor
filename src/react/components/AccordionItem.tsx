// @ts-nocheck
import React from 'react';
import { AccordionItemClasses } from '../../shared/classes/AccordionItemClasses.js';
import { AccordionItemColors } from '../../shared/colors/AccordionItemColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';
import { useDarkClasses } from '../shared/use-dark-classes.js';

const AccordionItem = (props) => {
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
  const colors = AccordionItemColors(colorsProp, dark);
  const c = themeClassesFn(AccordionItemClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

AccordionItem.displayName = 'AccordionItem';
export default AccordionItem;
