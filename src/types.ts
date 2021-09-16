import type { ReactNode } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
type IAllStyles = ViewStyle & TextStyle;
export type Prefixed<K extends string, T> = `${K}${Extract<
  T,
  boolean | number | string
>}`;

type ThemedIAllStyles<Theme> = keyof {
  [Key in keyof Theme as Prefixed<Key, Theme>]: true;
};

type ExtendStyles<Theme, Breakpoints> = {
  [Name in keyof IAllStyles]?:
    | ThemedIAllStyles<Theme>
    | {
        [Point in keyof Breakpoints as Point extends string
          ? `@${Point}`
          : Point]?: ThemedIAllStyles<Theme> | IAllStyles[Name];
      };
};

interface AllStyles<Theme, Breakpoints>
  extends ExtendStyles<Theme, Breakpoints> {
  _hover?: AllStyles<Theme, Breakpoints>;
  _pressed?: AllStyles<Theme, Breakpoints>;
  _focus?: AllStyles<Theme, Breakpoints>;
}

// Todo - improve TS support
// @ts-ignore
export interface IStyles<Theme, Breakpoints, DefinedStyles>
  extends AllStyles<Theme, Breakpoints> {
  variants?: {
    [key: string | number]: {
      [key: string | number]: AllStyles<Theme, Breakpoints>;
    };
  };
  defaultVariants?: 'variants' extends keyof DefinedStyles
    ? {
        [Name in keyof DefinedStyles['variants']]?: keyof DefinedStyles['variants'][Name];
      }
    : undefined;
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
