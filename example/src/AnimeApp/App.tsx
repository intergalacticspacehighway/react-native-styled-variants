import React from 'react';
import { Pressable, Text, View, Image, Dimensions } from 'react-native';
import { Header } from '../components/Header';
import { createVariant, ThemeProvider } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const { height } = Dimensions.get('window');
const avatarImages = {
  sad: 'https://images2.fanpop.com/image/photos/13300000/Depressed-zuko-13308184-640-480.jpg',
  happy:
    'https://www.looper.com/img/gallery/why-aangs-power-in-avatar-the-last-airbender-is-more-terrifying-than-you-think/intro-1616420787.jpg',
  blush:
    'https://imgix.bustle.com/uploads/image/2020/7/20/8524871a-79a5-448d-9d24-418c50a58618-avatar-aang.png?w=1200&h=630&fit=crop&crop=faces&fm=jpg',
  peace:
    'https://therockle.com/wp-content/uploads/2021/05/Best-Uncle-Iroh-Quotes-min-2.jpg',
  appa: 'https://lh3.googleusercontent.com/proxy/eVh59IZT4R742id5zRlT0dMnxCR5NlX1WDfCgFvWoEX84nEjjYNnfWxnNKmoRQ9u_y_WsvYW8zZJs1GlO-IMkSFyhYK9JfvX2Sis7JtRJwxUOBWavHo',
  fire: 'https://i.redd.it/o8zi2sok5a461.jpg',
  zuko: 'https://images.squarespace-cdn.com/content/57fd5882e6f2e1489b27ecb7/1595447779082-AN5W87XI9KSMLVMSMR0C/avatar-the-last-airbenderzuko.png?content-type=image%2Fpng',
};

const mood = Object.keys(avatarImages);

export default () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Container>
          <Header />
          <Screen />
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
    <View
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '$space.5',
      }}
    >
      <Image
        source={{
          uri: avatarImages[mood[imageIndex]],
          cache: 'force-cache',
        }}
        resizeMode="contain"
        sx={{ height: height / 1.8, width: '100%' }}
        key={avatarImages[mood[imageIndex]]}
      />
      <View sx={{ alignItems: 'center', marginTop: 50 }}>
        <Button onPress={changeImage}>
          <StyledText uppercase bold>
            {mood[imageIndex]}
          </StyledText>
        </Button>
      </View>
    </View>
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
  borderColor: '$colors.blue.1',
  width: 150,
  alignItems: 'center',
  _pressed: {
    backgroundColor: '$colors.blue.2',
  },
  _hover: {
    backgroundColor: '$colors.blue.3',
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
