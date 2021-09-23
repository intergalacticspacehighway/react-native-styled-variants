//@ts-nocheck
import type { ReactNode } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type IStyle = {
  [key: string]: any;
  varians?: {
    [key: string]: any;
  };
  defaultVariants?: {
    [key: string]: any;
  };
};

export type GetVariantProps<Style extends IStyle> = {
  [Key in keyof Style['variants']]?: keyof Style['variants'][Key] extends
    | 'true'
    | 'false'
    ? boolean
    : keyof Style['variants'][Key];
};

type IBreakpoints = {
  'base'?: number;
  'sm'?: number;
  'md'?: number;
  'lg'?: number;
  'xl'?: number;
  '2xl'?: number;
};

type AppendPrefixAndTokenise<Theme, IsFirstIteration> = keyof {
  [Key in keyof Theme as Theme[Key] extends string | number
    ? `${Key}`
    : // If first iteration append $
      `${IsFirstIteration extends true
        ? '$'
        : ''}${Key}.${AppendPrefixAndTokenise<Theme[Key], false>}`]: true;
};

type TokeniseTheme<Theme> = AppendPrefixAndTokenise<Theme, true>;

type ExtendStyleWithBreakpointValues<Theme, Style, Breakpoints> = {
  [Key in keyof Style]?:
    | TokeniseTheme<Theme>
    | (Style[Key] & {})
    | {
        [Breakpoint in keyof Breakpoints as `@${Breakpoint}`]?:
          | TokeniseTheme<Theme>
          | (Style[Key] & {});
      };
};

export type RNStyles<Theme, BreakPoints> = ExtendStyleWithBreakpointValues<
  Theme,
  TextStyle & ImageStyle & ViewStyle,
  BreakPoints
>;

interface AllStyles<Theme, Breakpoints> extends RNStyles<Theme, Breakpoints> {
  _hover?: RNStyles<Theme, Breakpoints>;
  _pressed?: RNStyles<Theme, Breakpoints>;
  _focus?: RNStyles<Theme, Breakpoints>;
}

export interface IStyles<Theme, Breakpoints, DefinedStyles extends IStyle>
  extends AllStyles<Theme, Breakpoints> {
  variants?: {
    [key: string | number]: {
      [key: string | number]: AllStyles<Theme, Breakpoints>;
    };
  };
  defaultVariants?: 'variants' extends keyof DefinedStyles
    ? GetVariantProps<DefinedStyles>
    : undefined;
}

export type IThemeProviderProps = {
  theme: any;
  currentBreakpoint?: any;
  breakpoints: IBreakpoints;
  children: ReactNode;
};
