//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { Text, Pressable, View } from 'react-native';
import { useTheme, ThemeProvider, styled } from 'react-native-styled-variants';
import { breakpoints, theme, darkColors, lightColors } from './theme';

export default function App() {
  return (
    <ThemeProvider breakpoints={breakpoints} theme={theme}>
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
      <StyledPressable
        checked={darkMode}
        onPress={() => setDarkMode(!darkMode)}
        onPressIn={() => console.log('hi')}
      >
        <StyledText>{darkMode ? 'dark mode' : 'light mode'}</StyledText>
      </StyledPressable>
      <StyledPressable2 checked onPressIn={() => console.log('hi')}>
        <StyledText>{darkMode ? 'dark mode' : 'light mode'}</StyledText>
      </StyledPressable2>
    </Container>
  );
};

const StyledPressable2 = styled(Pressable, {
  padding: '$space.3',
  backgroundColor: '$colors.primary',
  _focus: {
    backgroundColor: '$colors.cardBg',
  },
  variants: {
    checked: {
      true: {
        _focus: {
          backgroundColor: '$colors.pressed',
        },
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

const StyledPressable = styled(Pressable, {
  padding: '$space.8',
  borderRadius: 8,
  shadowColor: '$colors.shadowColor',
  _pressed: {
    backgroundColor: '$colors.pressed',
  },
  _hover: {
    backgroundColor: '$colors.hover',
  },
  _focus: {
    borderWidth: 10,
    borderColor: 'pink',
  },
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  backgroundColor: '$colors.cardBg',
  variants: {
    checked: {
      true: {
        backgroundColor: 'black',
        _pressed: {
          backgroundColor: 'pink',
        },
        _focus: {
          backgroundColor: '$colors.blue.200',
        },
      },
    },
  },
});

const StyledText = styled(Text, {
  padding: { '@base': 30, '@md': 90, '@xl': 5 },
  borderWidth: 1,
  borderColor: '$colors.borderColor',
  color: '$colors.textColor',
  variants: {
    color: {
      blue: {
        color: 'white',
      },
      indigo: {
        color: 'black',
        padding: '$space.1',
      },
    },
    size: {
      md: {
        padding: { '@md': 10 },
      },
    },
  },
});
