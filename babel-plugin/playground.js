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
const SXY = ({ style }) => {
  return (
    <Button sx={{ backgroundColor: 'yellow' }} style={[style]}>
      <StyledText bold>ABCD</StyledText>
    </Button>
  );
};
`);
