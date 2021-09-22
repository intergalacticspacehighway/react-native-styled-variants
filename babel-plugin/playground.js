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
  });

  // generate code <- ast
  const output = generate(ast, code);
  console.log(output.code); // 'const x = 1;'
}

transformToStyles(`
const App = () => {

  const renderIcon = <View sx={{ color: '$colors.maroon.1' }} />;

  return <>
    {list.map(item => {
      return <View sx={{margin: "$colors.blue", padding: {"@base" : 10, "@sm": 20} }} style={[{margin: 10}]} />
    })}
  </>
}
`);
