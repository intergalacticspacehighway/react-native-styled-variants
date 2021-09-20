const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitor = require('./visitor');
const utilityPropVisitor = require('./utility-prop-v2');

function transformToStyles(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  traverse(ast, {
    ...visitor,
    'Program'(path) {
      visitor.Program(path);
      utilityPropVisitor.Program(path);
    },
    'FunctionDeclaration|ArrowFunctionExpression'(path) {
      utilityPropVisitor['FunctionDeclaration|ArrowFunctionExpression'](path);
    },
  });

  // generate code <- ast
  const output = generate(ast, code);
  console.log(output.code); // 'const x = 1;'
}

transformToStyles(`
const shadow = {x: 1}
export default () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Container>
          <View style={sx({ flex: 1, ...shadow })}>
            <View style={sx({ flex: 2 })}>
              <Header />
            </View>
            <Screen />
          </View>
        </Container>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

`);
