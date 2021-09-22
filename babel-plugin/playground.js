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
export const StyledText = createVariant(Text, {
  color: "$colors.blueGray900",
  fontSize: "$fontSizes.md",
  variants: {
    sidebar: {
      true: {
        color: "$colors.blueGray100",
        paddingHorizontal: "$space.16",
        paddingVertical: "$space.4",
      },
    },
    focused: {
      true: {
        color: "white",
        backgroundColor: "$colors.blueGray800",
      },
    },
    primary: {
      true: { color: "$colors.primary" },
    },
    secondary: {
      true: { fontSize: "$fontSizes.md" },
    },
    heading: {
      true: { fontSize: "$fontSizes.2xl", fontWeight: "800" },
    },
    size: {
      xl: { fontSize: "$fontSizes.xl" },
      "2xl": { fontSize: "$fontSizes.2xl" },
    },
    bold: {
      true: { fontWeight: "800" },
    },
  },
});
`);
