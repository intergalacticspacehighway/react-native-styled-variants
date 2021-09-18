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
const Button = createVariant(Pressable, {
  borderWidth: 2,
  borderRadius: 4,
  paddingHorizontal: Platform.OS({web: '$space.5'}),
  paddingVertical: '$space.4',
  borderColor: '$colors.red.2',
  width: 150,
  alignItems: 'center',
  _hover: {
    backgroundColor: '$colors.red.0',
  },
  _pressed: {
    backgroundColor: '$colors.red.1',
  },
});
`);
