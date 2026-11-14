// @ts-nocheck
import React from 'react';
import SegmentedButton from './SegmentedButton.tsx';

const Tab = (props) => {
  const { active = false, children, ...rest } = props;
  return (
    <SegmentedButton active={active} strong rounded {...rest}>
      {children}
    </SegmentedButton>
  );
};

Tab.displayName = 'Tab';
export default Tab;
