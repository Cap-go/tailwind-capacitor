// @ts-nocheck
import { useContext } from 'react';
import { CapacitorContext } from './CapacitorContext.js';

const useTheme = ({ ios, material } = {}) => {
  const context = useContext(CapacitorContext);
  let theme = context.theme || 'ios';
  if (ios) theme = 'ios';
  if (material) theme = 'material';
  return theme;
};

export { useTheme };
