// @ts-nocheck
import React from 'react';
import { NoteClasses } from '../../shared/classes/NoteClasses.js';
import { NoteColors } from '../../shared/colors/NoteColors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const Note = (props) => {
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
  const colors = NoteColors(colorsProp);
  const c = themeClassesFn(NoteClasses(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

Note.displayName = 'Note';
export default Note;
