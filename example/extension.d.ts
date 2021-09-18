import 'react-native';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

type IBreakpoints = {
  'base'?: number;
  'sm'?: number;
  'md'?: number;
  'lg'?: number;
  'xl'?: number;
  '2xl'?: number;
};

type ExtendStyleWithBreakpointValues<Style, Breakpoints> = {
  [Key in keyof Style]?:
    | Style[Key]
    | {
        [Breakpoint in keyof Breakpoints as `@${Breakpoint}`]?: Style[Key];
      };
};

declare module 'react-native' {
  interface ViewProps {
    sx?: ExtendStyleWithBreakpointValues<ViewStyle, IBreakpoints>;
  }
  interface ImageProps {
    sx?: ExtendStyleWithBreakpointValues<ImageStyle, IBreakpoints>;
  }
  interface TextProps {
    sx?: ExtendStyleWithBreakpointValues<TextStyle, IBreakpoints>;
  }
}
