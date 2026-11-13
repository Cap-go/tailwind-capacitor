/* @ts-nocheck */
import { useContext } from 'react';
import { CapacitorContext } from './CapacitorContext.js';

const useDarkClasses = () => {
  const context = useContext(CapacitorContext);
  return (classNames) => {
    if (!context.dark) return '';
    return classNames;
  };
};

export { useDarkClasses };
