const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitor = require('./visitor');
const utilityPropVisitorv3 = require('./utility-prop-v3');

function transformToStyles(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  traverse(ast, {
    ...visitor,
    'Program'(path) {
      visitor.Program(path);
      utilityPropVisitorv3.Program(path);
    },
    'FunctionDeclaration|ArrowFunctionExpression'(path, state) {
      utilityPropVisitorv3['FunctionDeclaration|ArrowFunctionExpression'](
        path,
        state
      );
    },
  });

  // generate code <- ast
  const output = generate(ast, code);
  console.log(output.code); // 'const x = 1;'
}

transformToStyles(`
import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View, Platform } from 'react-native';
import { Header } from '../components/Header';
import { createVariant, ThemeProvider, sx } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Animated } from 'react-native';


const Screen = () => {
  const [imageIndex, setImageIndex] = React.useState(getRandomInt(mood.length));
  const changeImage = () => {
    setImageIndex((imageIndex + 1) % mood.length);
  };

  return (
    <>
      <View alignItems="center" flex={1}>
        <Button onPress={changeImage} accessibilityRole="button">
          {({ pressed }) => {
            console.log('EFfe ', pressed);
            return (
              <StyledText
                uppercase
                bold
                style={sx({ color: pressed ? '$colors.white' : undefined })}
              >
                {mood[imageIndex]}
              </StyledText>
            );
          }}
        </Button>
      </View>
    </>
  );
};

`);
