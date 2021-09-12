import type { ReactNode } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';

interface AllStyles extends ViewStyle, TextStyle {
  _hover?: ViewStyle | TextStyle;
  _pressed?: ViewStyle | TextStyle;
  _focus?: ViewStyle | TextStyle;
}

// Todo - improve TS support
// @ts-ignore
export interface IStyles<Theme, Breakpoints> extends AllStyles {
  variants?: {
    [key: string]: {
      [key: string]: AllStyles;
    };
  };
}

export type IThemeProviderProps = {
  theme: any;
  currentBreakpoint?: any;
  breakpoints: IBreakpoints;
  children: ReactNode;
};

export type IBreakpoints = {
  [key: string]: number;
};
