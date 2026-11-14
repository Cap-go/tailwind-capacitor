// @ts-nocheck
import React from 'react';
import { PickerClasses } from '../../shared/classes/PickerClasses.js';
import { PickerColors } from '../../shared/colors/PickerColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Picker = (props) => {
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
  const colors = PickerColors(colorsProp);
  const c = themeClassesFn(PickerClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Picker.displayName = 'Picker';
export default Picker;
