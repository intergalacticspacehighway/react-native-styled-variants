//@ts-nocheck
import React from 'react';

export const useControlledState = <T>(val: T) => {
  const [state, setState] = React.useState<T>(val);

  // ToDo make it controlled state

  return [state, setState];
};

export const getCurrentBreakpoint = (
  windowWidth,
  breakpointsSortedKeys,
  breakpoints
) => {
  for (let i = breakpointsSortedKeys.length - 1; i > -1; i--) {
    const breakpointValue = breakpoints[breakpointsSortedKeys[i]];
    if (breakpointValue >= windowWidth) {
      return breakpointsSortedKeys[i];
    }
  }
  return breakpointsSortedKeys[0];
};

export const getClosestResponsiveValue = (
  values,
  currentBreakpoint,
  breakpointsSortedKeys
) => {
  let value;
  if (currentBreakpoint in values) {
    value = values[currentBreakpoint];
  } else {
    for (let i = breakpointsSortedKeys.length - 1; i > -1; i--) {
      value = values[breakpointsSortedKeys[i]];
      if (breakpointsSortedKeys[i] === currentBreakpoint) {
        break;
      }
    }
  }
  return value;
};
