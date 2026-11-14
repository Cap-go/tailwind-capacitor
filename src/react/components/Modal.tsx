// @ts-nocheck
import React from 'react';
import { ModalClasses } from '../../shared/classes/ModalClasses.js';
import { ModalColors } from '../../shared/colors/ModalColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Modal = (props) => {
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
  const colors = ModalColors(colorsProp);
  const c = themeClassesFn(ModalClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Modal.displayName = 'Modal';
export default Modal;
