// @ts-nocheck
import React from 'react';
import Segmented from './Segmented.tsx';

const Tabs = (props) => {
  const { children, ...rest } = props;
  return (
    <Segmented strong rounded {...rest}>
      {children}
    </Segmented>
  );
};

Tabs.displayName = 'Tabs';
export default Tabs;
