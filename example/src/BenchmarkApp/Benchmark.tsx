import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useHover, usePress } from 'react-native-styled-variants';
import styled, {
  ThemeProvider as StyledComponentThemeProvider,
} from 'styled-components/native';
import { ThemeProvider } from './theme';
import { createVariant, theme } from './theme';

export const StyledComponentsButton = () => {
  const { onHoverIn, onHoverOut, isHovered } = useHover({});
  const { onPressOut, onPressIn, isPressed } = usePress({});
  return (
    <StyledButton
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      isHovered={isHovered}
      isPressed={isPressed}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <StyledText bold>Bring lightness</StyledText>
    </StyledButton>
  );
};

const StyledText = styled(Text)`
  color: white;
  font-weight: ${(props) => (props.bold ? '900' : undefined)};
`;

const StyledButton = styled(Pressable)`
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 4px;
  height: 35px;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  background-color:${(props: any) =>
    props.isPressed
      ? props.theme.colors.pressed
      : props.isHovered
      ? props.theme.colors.button_hover
      : props.theme.colors.button_primary}
  };`;

export const StyledVariantButton = () => {
  return (
    <VariantButton>
      <VariantText bold>Bring lightness</VariantText>
    </VariantButton>
  );
};

const VariantButton = createVariant(Pressable, {
  paddingLeft: 15,
  paddingRight: 15,
  borderRadius: 4,
  height: 35,
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 15,
  backgroundColor: '$colors.button_primary',
  _pressed: {
    backgroundColor: '$colors.pressed',
  },
  _hovered: {
    backgroundColor: '$colors.button_hover',
  },
});

const VariantText = createVariant(Text, {
  color: '$colors.white',
  variants: {
    bold: {
      true: {
        fontWeight: '900',
      },
    },
  },
});

export default () => {
  return (
    <StyledComponentThemeProvider theme={theme}>
      <ThemeProvider>
        <View style={{ alignItems: 'center' }}>
          <View style={{ marginVertical: 20 }} />
          <StyledComponentsButton />
          <View style={{ marginVertical: 20 }} />
          <StyledVariantButton />
        </View>
      </ThemeProvider>
    </StyledComponentThemeProvider>
  );
};
