//@ts-nocheck
import React from 'react';

export const useControlledState = <T>(val: T) => {
  const [state, setState] = React.useState<T>(val);

  // ToDo make it controlled state

  return [state, setState];
};

export function getClosestBreakpoint(breakpoints: any, windowWidth: number) {
  let dimValues = Object.values(breakpoints);
  let index = -1;
  for (let i = 0; i < dimValues.length; i++) {
    if (dimValues[i] === windowWidth) {
      index = i;
      break;
    } else if (dimValues[i] > windowWidth && i !== 0) {
      index = i - 1;
      break;
    }
    // If windowWidth is greater than last available breakpoint clamp it to last index
    else if (dimValues[i] < windowWidth && i === dimValues.length - 1) {
      index = i;
      break;
    }
  }
  return index;
}

export const getCurrentBreakpoint = (
  windowWidth,
  breakpointsArray,
  breakpoints
) => {
  const breakpoint = getClosestBreakpoint(breakpoints, windowWidth);
  return breakpointsArray[breakpoint];
};

export const getClosestResponsiveValue = (
  values,
  currentBreakpoint,
  breakpointsArray
) => {
  let val;
  if (currentBreakpoint in values) {
    val = currentBreakpoint;
  } else {
    let currentBreakpointIndex = breakpointsArray.findIndex(
      (v) => v === currentBreakpoint
    );
    for (let i = currentBreakpointIndex; i >= 0; i--) {
      if (breakpointsArray[i] in values) {
        val = breakpointsArray[i];
        break;
      }
    }
  }
  return values[val];
};
