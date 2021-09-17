const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitor = require('./visitor');
const utilityPropVisitor = require('./utility-prop-visitor');

function transformToStyles(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  traverse(ast, {
    ...visitor,
    ...utilityPropVisitor,
    Program(path) {
      visitor.Program(path);
      utilityPropVisitor.Program(path);
    },
  });

  // generate code <- ast
  const output = generate(ast, code);
  console.log(output.code); // 'const x = 1;'
}

transformToStyles(`
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  Text,
  View,
  Image,
  Dimensions,
} from 'react-native';
import { Header } from '../components/Header';
import { createVariant, ThemeProvider } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');
const avatarImages = {
  sad: 'https://images2.fanpop.com/image/photos/13300000/Depressed-zuko-13308184-640-480.jpg',
  happy:
    'https://www.looper.com/img/gallery/why-aangs-power-in-avatar-the-last-airbender-is-more-terrifying-than-you-think/intro-1616420787.jpg',
  blush:
    'https://imgix.bustle.com/uploads/image/2020/7/20/8524871a-79a5-448d-9d24-418c50a58618-avatar-aang.png?w=1200&h=630&fit=crop&crop=faces&fm=jpg',
  iroh: 'https://therockle.com/wp-content/uploads/2021/05/Best-Uncle-Iroh-Quotes-min-2.jpg',
};

const mood = ['sad', 'happy', 'blush', 'iroh'];
export default () => {
  const [imageIndex, setImageIndex] = React.useState(0);
  const changeImage = () => {
    setImageIndex((imageIndex + 1) % mood.length);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Container>
          <Header />
          <View
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '$colors.blue.1',
            }}
          >
            <Image
              source={{
                uri: avatarImages[mood[imageIndex]],
                cache: 'force-cache',
              }}
              resizeMode="contain"
              sx={{ height: height / 2, width: '100%' }}
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
        </Container>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};
`);
