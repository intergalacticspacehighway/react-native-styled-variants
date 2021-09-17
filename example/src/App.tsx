import React, { useEffect, useState } from 'react';
import { Text, Pressable, View, ScrollView } from 'react-native';
import {
  useTheme,
  createTheme,
  useCurrentBreakpoint,
} from 'react-native-styled-variants';
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

function AppContainer() {
  return (
    <Container>
      <ScrollView>
        <Text>Hello from scrollview</Text>
      </ScrollView>
      <View
        sx={{
          backgroundColor: {
            '@sm': '$colors.rose.50',
            '@lg': '$colors.rose.800',
          },
          alignItems: 'center',
          borderWidth: 4,
        }}
        style={{ borderWidth: 10 }}
        nativeID="122"
      >
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
}

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
  paddingHorizontal: 15,
  height: 35,
  _pressed: {
    backgroundColor: '$colors.pressed',
  },
  _hover: {
    backgroundColor: '$colors.button_hover',
  },
  variants: {
    size: {
      small: {
        backgroundColor: 'black',
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
