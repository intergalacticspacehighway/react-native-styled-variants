import React from 'react';
import { Pressable, Text } from 'react-native';
import { useHover, usePress } from 'react-native-styled-variants';
import xyz from 'styled-components/native';

export const StyledComponentsButton = ({ onPress }) => {
  const { onHoverIn, onHoverOut, isHovered } = useHover({});
  const { onPressOut, onPressIn, isPressed } = usePress({});
  return (
    <Button
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      isHovered={isHovered}
      isPressed={isPressed}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
    >
      <StyledText bold>Bring lightness</StyledText>
    </Button>
  );
};

const StyledText = xyz(Text)`
color: white;
font-weight: ${(props) => (props.bold ? '900' : undefined)};
`;

const Button = xyz(Pressable)`
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
