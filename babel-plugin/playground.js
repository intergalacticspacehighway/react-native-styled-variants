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
    'FunctionDeclaration|ArrowFunctionExpression'(path) {
      utilityPropVisitorv3['FunctionDeclaration|ArrowFunctionExpression'](path);
    },
  });

  // generate code <- ast
  const output = generate(ast, code);
  console.log(output.code); // 'const x = 1;'
}

transformToStyles(`
  const App = () => {
    return  <View flex={1}
    shadowOffset={{
      width: 0,
      height: 2,
    }}
    shadowOpacity={0.25}
    shadowRadius={3.84}
    elevation={5}
    >
    <View flex={2}>
      <Header />
    </View>
    <Screen />
  </View>
  }
`);
