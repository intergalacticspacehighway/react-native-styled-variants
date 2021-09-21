import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View, Platform } from 'react-native';
import { Header } from '../components/Header';
import { createVariant, ThemeProvider } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Animated } from 'react-native';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const avatarImages = {
  iroh: 'https://therockle.com/wp-content/uploads/2021/05/Best-Uncle-Iroh-Quotes-min-2.jpg',
  fire: 'https://i.redd.it/o8zi2sok5a461.jpg',
  zuko: 'https://images.squarespace-cdn.com/content/57fd5882e6f2e1489b27ecb7/1595447779082-AN5W87XI9KSMLVMSMR0C/avatar-the-last-airbenderzuko.png?content-type=image%2Fpng',
  katara:
    'https://qph.fs.quoracdn.net/main-qimg-2e4d0f3f76aad3529ec36c6f0b643301',
};

const mood = Object.keys(avatarImages);

export default () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.overflowY = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Container>
          <View flex={1}>
            <View flex={2}>
              <Header />
            </View>
            <Screen />
          </View>
        </Container>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const Screen = () => {
  const [imageIndex, setImageIndex] = React.useState(getRandomInt(mood.length));
  const changeImage = () => {
    setImageIndex((imageIndex + 1) % mood.length);
  };

  return (
    <>
      <View justifyContent="center" alignItems="center" flex={4}>
        <AnimatedImage uri={avatarImages[mood[imageIndex]]} />
      </View>
      <View alignItems="center" flex={1}>
        <Button onPress={changeImage} accessibilityRole="button">
          <StyledText uppercase bold>
            {mood[imageIndex]}
          </StyledText>
        </Button>
      </View>
    </>
  );
};

const AnimatedImage = ({ uri }) => {
  const opacityValue = useRef(new Animated.Value(0)).current;

  const onLoad = () => {
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    opacityValue.setValue(0);
  }, [uri, opacityValue]);

  return (
    <Animated.Image
      onLoad={onLoad}
      source={{
        uri: uri,
        cache: 'force-cache',
      }}
      resizeMode="contain"
      flex={0.9}
      borderRadius={10}
      style={[
        {
          width: '95%',
          opacity: opacityValue,
          transform: [
            {
              scale: opacityValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
      key={uri}
    />
  );
};

const Container = createVariant(View, {
  backgroundColor: '$colors.gray.3',
  height: '100%',
});

const Button = createVariant(Pressable, {
  borderWidth: 2,
  borderRadius: 4,
  paddingHorizontal: '$space.5',
  paddingVertical: '$space.4',
  borderColor: '$colors.red.2',
  width: Platform.select({ web: 250, default: '80%' as any }),
  alignItems: 'center',
  _hover: {
    backgroundColor: '$colors.red.0',
  },
  _pressed: {
    backgroundColor: '$colors.red.1',
  },
});

const StyledText = createVariant(Text, {
  color: '$colors.maroon.0',
  fontSize: '$fontSize.lg',
  variants: {
    uppercase: {
      true: {
        textTransform: 'uppercase',
      },
    },
    bold: {
      true: {
        fontWeight: 'bold',
      },
    },
  },
  defaultVariants: {
    bold: true,
  },
});
