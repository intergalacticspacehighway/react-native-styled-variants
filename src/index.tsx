import React, { ReactNode, useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import type {
  GetVariantProps,
  IStyles,
  IThemeProviderProps,
  RNStyles,
} from './types';
import {
  useControlledState,
  getCurrentBreakpoint,
  getClosestResponsiveValue,
} from './utils';

const ThemeProviderImpl = (props: IThemeProviderProps) => {
  const [theme, _setTheme] = useControlledState(props.theme);
  const [breakpoints] = useControlledState(props.breakpoints);

  const breakpointsSortedKeys = React.useMemo(() => {
    return Object.entries(breakpoints)
      .sort(([, a], [, b]) => a - b)
      .map((v) => v[0]);
  }, [breakpoints]);

  const [currentBreakpoint, _setCurrentBreakpoint] = useControlledState(
    props.currentBreakpoint ??
      getCurrentBreakpoint(
        Dimensions.get('window').width,
        breakpointsSortedKeys,
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
              breakpointsSortedKeys
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

  const setTheme = useCallback(
    (newTheme: any) => {
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
                breakpointsSortedKeys
              ),
          })
        );
      }
      _setTheme(newTheme);
    },
    [
      _setTheme,
      breakpointsSortedKeys,
      currentBreakpoint,
      styleSheets,
      themeDependentStyleSheetIds,
    ]
  );

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
                breakpointsSortedKeys
              ),
          })
        );
      }
      _setCurrentBreakpoint(newBreakpoint);
    },
    [
      _setCurrentBreakpoint,
      breakpointDependentStyleSheetIds,
      breakpointsSortedKeys,
      styleSheets,
      theme,
    ]
  );

  const resolveResponsiveValue = (values: any) => {
    return getClosestResponsiveValue(
      values,
      currentBreakpoint,
      breakpointsSortedKeys
    );
  };

  React.useEffect(() => {
    function updateCurrentBreakpoint(dimensions: any) {
      setCurrentBreakpoint(
        getCurrentBreakpoint(
          dimensions.window.width,
          breakpointsSortedKeys,
          breakpoints
        )
      );
    }
    Dimensions.addEventListener('change', updateCurrentBreakpoint);
    return () => {
      Dimensions.removeEventListener('change', updateCurrentBreakpoint);
    };
  }, [setCurrentBreakpoint, breakpointsSortedKeys, breakpoints]);

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
        resolveResponsiveValue,
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
  return {
    currentBreakpoint: style.currentBreakpoint,
    resolveResponsiveValue: style.resolveResponsiveValue,
  };
};

export const useStyleSheet = (id: any, styleFn: any, dependsUpon: string[]) => {
  const style = React.useContext(ThemeContext);
  return style.generateStyleSheet(id, styleFn, dependsUpon);
};

const ThemeContext = React.createContext({
  theme: null,
  currentBreakpoint: null,
  setTheme: (_theme: any) => {},
  setCurrentBreakpoint: (_currentBreakpoint: any) => {},
  generateStyleSheet: (_id: any, _styleFn: any, _dependsUpon: any) => {},
  breakpoints: {},
  resolveResponsiveValue: (_values: any) => {},
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

export function createTheme<Theme, Breakpoints>({
  theme,
  breakpoints,
}: {
  theme: Theme;
  breakpoints: Breakpoints;
}) {
  function ThemeProvider({ children }: { children: ReactNode }) {
    return (
      <ThemeProviderImpl
        theme={theme}
        // Todo - improve TS support
        //@ts-ignore
        breakpoints={breakpoints}
        children={children}
      />
    );
  }
  // The below is a noOp function, it'll be removed by the transpiler and replaced with React component
  function createVariant<Component extends React.ComponentType, DefinedStyles>(
    _Component: Component,
    _styles: DefinedStyles & IStyles<Theme, Breakpoints, DefinedStyles>
  ) {
    return {} as React.FC<
      GetVariantProps<DefinedStyles> & React.ComponentProps<Component>
    >;
  }

  function sx(_styles: RNStyles<Theme, Breakpoints>) {
    return {} as ReturnType<typeof StyleSheet.create>;
  }

  return { ThemeProvider, createVariant, sx };
}
