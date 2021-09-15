const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitor = require('./visitor');

function transformToStyles(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  traverse(ast, visitor);

  // generate code <- ast
  const output = generate(ast, code);
  console.log(output.code); // 'const x = 1;'
}

transformToStyles(`

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
  defaultVariants: {
    size: "large"
  }
});
  
`);
