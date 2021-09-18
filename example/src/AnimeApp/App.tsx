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
  sad: 'https://images2.fanpop.com/image/photos/13300000/Depressed-zuko-13308184-640-480.jpg',
  happy:
    'https://www.looper.com/img/gallery/why-aangs-power-in-avatar-the-last-airbender-is-more-terrifying-than-you-think/intro-1616420787.jpg',
  blush:
    'https://imgix.bustle.com/uploads/image/2020/7/20/8524871a-79a5-448d-9d24-418c50a58618-avatar-aang.png?w=1200&h=630&fit=crop&crop=faces&fm=jpg',
  peace:
    'https://therockle.com/wp-content/uploads/2021/05/Best-Uncle-Iroh-Quotes-min-2.jpg',
  fire: 'https://i.redd.it/o8zi2sok5a461.jpg',
  zuko: 'https://images.squarespace-cdn.com/content/57fd5882e6f2e1489b27ecb7/1595447779082-AN5W87XI9KSMLVMSMR0C/avatar-the-last-airbenderzuko.png?content-type=image%2Fpng',
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
          <View sx={{ flex: 1 }}>
            <View sx={{ flex: 2 }}>
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
      <View
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 4,
        }}
      >
        <AnimatedImage uri={avatarImages[mood[imageIndex]]} />
      </View>
      <View
        sx={{
          alignItems: 'center',
          flex: 1,
        }}
      >
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
      sx={{ flex: 0.9, width: '95%', borderRadius: 10 }}
      style={{
        opacity: opacityValue,
        transform: [
          {
            scale: opacityValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
      }}
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
  color: '$colors.white',
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
});
