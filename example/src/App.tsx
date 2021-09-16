import React, { useEffect, useState } from 'react';
import { Text, Pressable, View } from 'react-native';
import { useTheme, createTheme } from 'react-native-styled-variants';
import { StyledComponentsButton } from './Benchmark';
import { breakpoints, theme, darkColors, lightColors } from './theme';
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/native';

const { createVariant, ThemeProvider } = createTheme({
  theme,
  breakpoints,
});

export default function App() {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      <ThemeProvider>
        <AppContainer />
      </ThemeProvider>
    </StyledComponentsThemeProvider>
  );
}

const AppContainer = () => {
  const [darkMode, setDarkMode] = useState(true);
  // useEffect(() => {
  //   setInterval(() => {
  //     setDarkMode((m) => !m);
  //   }, 5000);
  // }, []);
  // useEffect(() => {
  //   if (darkMode) {
  //     setTheme({
  //       ...theme,
  //       colors: {
  //         ...theme.colors,
  //         ...darkColors,
  //       },
  //     });
  //   } else {
  //     setTheme({
  //       ...theme,
  //       colors: {
  //         ...theme.colors,
  //         ...lightColors,
  //       },
  //     });
  //   }
  // }, [darkMode, setTheme]);

  return (
    <Container>
      <View>
        {darkMode ? 'd' : 'k'}
        <StyledComponentsButton />
        <VariantButton />
        {/* <VariantButton />
        <VariantButton />
        <VariantButton />
        <VariantButton />
        <VariantButton /> */}
      </View>
    </Container>
  );
};

const VariantButton = () => {
  return (
    <Button>
      <StyledText bold>Bring lightness</StyledText>
    </Button>
  );
};

const StyledText = createVariant(Text, {
  color: 'white',
  variants: {
    bold: {
      true: {
        fontWeight: '900',
      },
    },
  },
});

const Button = createVariant(Pressable, {
  backgroundColor: '$colors.button_primary',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 4,
  fontSize: 15,
  height: {
    '@sm': '$space.30',
  },
  _pressed: {
    backgroundColor: {
      '@sm': 'black',
    },
  },
  variants: {
    size: {
      large: {
        backgroundColor: 'black',
      },
      small: {
        height: 35,
      },
    },
  },
  defaultVariants: { size: 'small' },
});

const Container = createVariant(View, {
  backgroundColor: '$colors.cardBg',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});
