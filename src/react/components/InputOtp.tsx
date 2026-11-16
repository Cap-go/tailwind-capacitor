// @ts-nocheck
import React from 'react';
import { InputOtpClasses } from '../../shared/classes/InputOtpClasses.js';
import { InputOtpColors } from '../../shared/colors/InputOtpColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';
import { useDarkClasses } from '../shared/use-dark-classes.js';

const InputOtp = (props) => {
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
  const colors = InputOtpColors(colorsProp, dark);
  const c = themeClassesFn(InputOtpClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

InputOtp.displayName = 'InputOtp';
export default InputOtp;
