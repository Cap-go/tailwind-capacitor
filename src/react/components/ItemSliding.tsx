/* @ts-nocheck */
import React from 'react';
import { ItemSlidingClasses } from '../../shared/classes/ItemSlidingClasses.js';
import { ItemSlidingColors } from '../../shared/colors/ItemSlidingColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const ItemSliding = (props) => {
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
  const colors = ItemSlidingColors(colorsProp);
  const c = themeClassesFn(ItemSlidingClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

ItemSliding.displayName = 'ItemSliding';
export default ItemSliding;
