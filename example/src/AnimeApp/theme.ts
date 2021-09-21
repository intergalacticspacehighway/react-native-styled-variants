import { createTheme } from 'react-native-styled-variants';

const theme = {
  colors: {
    white: '#fff',
    sky: '#9ab1d9',
    gray: {
      0: '#504f63',
      1: '#34304e',
      2: '#393556',
      3: '#0e0d20',
    },
    blue: {
      0: '#a5f0f7',
      1: '#53abe4',
      2: '#2381dc',
      3: '#001f45',
    },
    maroon: {
      0: '#d66e84',
      1: '#e27b8c',
      2: '#ab4367',
      3: '#631a4e',
    },
    red: {
      0: '#f06d65',
      1: '#f05d58',
      2: '#e02a28',
    },
  },
  space: {
    'px': '1px',
    '0': '0',
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 40,
    '12': 48,
    '16': 64,
    '20': 80,
    '24': 96,
    '32': 128,
  },
  fontSize: {
    lg: 20,
  },
};

const breakpoints = {
  'base': 0,
  'sm': 480,
  'md': 768,
  'lg': 992,
  'xl': 1280,
  '2xl': 1536,
};

export const { createVariant, ThemeProvider, sx } = createTheme({
  theme,
  breakpoints,
});

export type ITheme = typeof theme;
export type IBreakpoints = typeof breakpoints;
