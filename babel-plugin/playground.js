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
    backgroundColor: '$colors.primary',
    padding: '$space.10',
    variants: {
      outlined: {
        true: {
          borderWidth: 4,
        },
      },
    },
  });
  
`);
