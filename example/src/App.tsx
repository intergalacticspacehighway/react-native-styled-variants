import React, { useEffect, useState } from 'react';
import { Text, Pressable, View } from 'react-native';
import { useTheme, createTheme } from 'react-native-styled-variants';
import { breakpoints, theme, darkColors, lightColors } from './theme';

const { styled, ThemeProvider } = createTheme({ theme, breakpoints });

export default function App() {
  return (
    <ThemeProvider>
      <AppContainer />
    </ThemeProvider>
  );
}
const AppContainer = () => {
  const [darkMode, setDarkMode] = useState(true);
  const { setTheme } = useTheme();
  useEffect(() => {
    if (darkMode) {
      setTheme({
        ...theme,
        colors: {
          ...theme.colors,
          ...darkColors,
        },
      });
    } else {
      setTheme({
        ...theme,
        colors: {
          ...theme.colors,
          ...lightColors,
        },
      });
    }
  }, [darkMode, setTheme]);

  return (
    <Container>
      <Button size="large" onPress={() => setDarkMode(!darkMode)}>
        <StyledText bold>
          {darkMode ? 'Bring lightness' : 'Bring darkness'}
        </StyledText>
      </Button>
    </Container>
  );
};

const StyledText = styled(Text, {
  color: 'white',
  variants: {
    bold: {
      true: {
        fontWeight: '900',
      },
    },
  },
});

const Button = styled(Pressable, {
  backgroundColor: '$colors.button_primary',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 4,
  _hover: {
    backgroundColor: '$colors.button_hover',
  },
  _focus: {
    backgroundColor: '$colors.indigo.600',
  },
  _pressed: {
    backgroundColor: '$colors.pink.700',
  },
  variants: {
    size: {
      large: {
        fontSize: 15,
        //@ts-ignore - Improve responsive typings
        height: { '@base': 35, '@sm': 50, '@md': 60, '@lg': 80, '@xl': 100 },
        paddingLeft: 15,
        paddingRight: 15,
      },
    },
  },
});

const Container = styled(View, {
  backgroundColor: '$colors.cardBg',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});
