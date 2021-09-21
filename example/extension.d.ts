import 'react-native';
import { RNStyles } from 'react-native-styled-variants';
import type { ITheme, IBreakpoints } from './src/AnimeApp/theme';

declare module 'react-native' {
  interface ViewProps extends RNStyles<ITheme, IBreakpoints> {}
  interface ImageProps extends RNStyles<ITheme, IBreakpoints> {}
  interface TextProps extends RNStyles<ITheme, IBreakpoints> {}
}
