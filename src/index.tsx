import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import type { IStyles, IThemeProviderProps } from './types';
import {
  useControlledState,
  getCurrentBreakpoint,
  getClosestResponsiveValue,
} from './utils';

// Todo: Improve typings!
// type IStyleFn = ({}) => any;

export const ThemeProvider = (props: IThemeProviderProps) => {
  const [theme, _setTheme] = useControlledState(props.theme);
  const [breakpoints] = useControlledState(props.breakpoints);

  const breakpointsArray = React.useMemo(() => {
    return Object.entries(breakpoints)
      .sort(([, a], [, b]) => a - b)
      .map((v) => v[0]);
  }, [breakpoints]);

  const [currentBreakpoint, _setCurrentBreakpoint] = useControlledState(
    props.currentBreakpoint ??
      getCurrentBreakpoint(
        Dimensions.get('window').width,
        breakpointsArray,
        breakpoints
      )
  );

  const styleSheets = React.useRef({} as any).current;
  const themeDependentStyleSheetIds = React.useRef({} as any).current;
  const breakpointDependentStyleSheetIds = React.useRef({} as any).current;

  const generateStyleSheet = (
    id: any,
    stylesFn: any,
    dependsUpon: string[]
  ) => {
    if (styleSheets[id]) {
      return styleSheets[id];
    } else {
      styleSheets[id] = StyleSheet.create(
        stylesFn({
          theme,
          currentBreakpoint,
          getClosestResponsiveValue: (values: any) =>
            getClosestResponsiveValue(
              values,
              currentBreakpoint,
              breakpointsArray
            ),
        })
      );

      if (dependsUpon.includes('theme')) {
        themeDependentStyleSheetIds[id] = stylesFn;
      }
      if (dependsUpon.includes('currentBreakpoint')) {
        breakpointDependentStyleSheetIds[id] = stylesFn;
      }

      return styleSheets[id];
    }
  };

  const setTheme = (newTheme: any) => {
    for (let key in themeDependentStyleSheetIds) {
      const styleFn = themeDependentStyleSheetIds[key];
      styleSheets[key] = StyleSheet.create(
        styleFn({
          theme: newTheme,
          currentBreakpoint,
          getClosestResponsiveValue: (values: any) =>
            getClosestResponsiveValue(
              values,
              currentBreakpoint,
              breakpointsArray
            ),
        })
      );
    }
    _setTheme(newTheme);
  };

  const setCurrentBreakpoint = useCallback(
    (newBreakpoint: any) => {
      for (let key in breakpointDependentStyleSheetIds) {
        const styleFn = breakpointDependentStyleSheetIds[key];
        styleSheets[key] = StyleSheet.create(
          styleFn({
            theme,
            currentBreakpoint: newBreakpoint,
            getClosestResponsiveValue: (values: any) =>
              getClosestResponsiveValue(
                values,
                newBreakpoint,
                breakpointsArray
              ),
          })
        );
      }
      _setCurrentBreakpoint(newBreakpoint);
    },
    [
      _setCurrentBreakpoint,
      breakpointDependentStyleSheetIds,
      breakpointsArray,
      styleSheets,
      theme,
    ]
  );

  React.useEffect(() => {
    function updateCurrentBreakpoint(dimensions: any) {
      setCurrentBreakpoint(
        getCurrentBreakpoint(
          dimensions.window.width,
          breakpointsArray,
          breakpoints
        )
      );
    }
    Dimensions.addEventListener('change', updateCurrentBreakpoint);
    return () => {
      Dimensions.removeEventListener('change', updateCurrentBreakpoint);
    };
  }, [setCurrentBreakpoint, breakpointsArray, breakpoints]);

  return (
    <ThemeContext.Provider
      {...props}
      value={{
        setCurrentBreakpoint,
        setTheme,
        theme,
        currentBreakpoint,
        generateStyleSheet,
        breakpoints,
      }}
    />
  );
};

export const useTheme = () => {
  const style = React.useContext(ThemeContext);
  return { theme: style.theme, setTheme: style.setTheme };
};

export const useCurrentBreakpoint = () => {
  const style = React.useContext(ThemeContext);
  return style.currentBreakpoint;
};

export const useStyleSheet = (id: any, styleFn: any, dependsUpon: string[]) => {
  const style = React.useContext(ThemeContext);
  return style.generateStyleSheet(id, styleFn, dependsUpon);
};

export const styled = (_Component: any, _styles: IStyles) => ({} as any);

const ThemeContext = React.createContext({
  theme: null,
  currentBreakpoint: null,
  setTheme: (_theme: any) => {},
  setCurrentBreakpoint: (_currentBreakpoint: any) => {},
  generateStyleSheet: (_id: any, _styleFn: any, _dependsUpon: any) => {},
  breakpoints: {},
});

export const useHover = ({ onHoverIn, onHoverOut }: any) => {
  const [isHovered, setHovered] = React.useState(false);

  return {
    isHovered,
    onHoverIn: (e: any) => {
      onHoverIn && onHoverIn(e);
      setHovered(true);
    },
    onHoverOut: (e: any) => {
      onHoverOut && onHoverOut(e);
      setHovered(false);
    },
  };
};

export const usePress = ({ onPressIn, onPressOut }: any) => {
  const [isPressed, setPressed] = React.useState(false);

  return {
    isPressed,
    onPressIn: (e: any) => {
      onPressIn && onPressIn(e);
      setPressed(true);
    },
    onPressOut: (e: any) => {
      onPressOut && onPressOut(e);
      setPressed(false);
    },
  };
};

export const useFocus = ({ onFocus, onBlur }: any) => {
  const [isFocused, setFocused] = React.useState(false);

  return {
    isFocused,
    onFocus: (e: any) => {
      onFocus && onFocus(e);
      setFocused(true);
    },
    onBlur: (e: any) => {
      onBlur && onBlur(e);
      setFocused(false);
    },
  };
};

export default {
  multiply(a: number, b: number) {
    return Promise.resolve(a * b);
  },
};
