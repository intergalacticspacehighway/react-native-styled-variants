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
    'Program'(path) {
      visitor.Program(path);
      utilityPropVisitor.Program(path);
    },
    'FunctionDeclaration|ArrowFunctionExpression'(path, state) {
      utilityPropVisitor['FunctionDeclaration|ArrowFunctionExpression'](
        path,
        state
      );
    },
    'CallExpression'(path, state) {
      visitor.CallExpression(path, state);
    },
  });

  // generate code <- ast
  const output = generate(ast, code);
  console.log(output.code); // 'const x = 1;'
}

transformToStyles(`
const App = () => {
  const pressed = false;
  return <View sx={pressed ? {backgroundColor: '$colors.blue'} : {}} style={[{margin: 10}]} />
}
`);
