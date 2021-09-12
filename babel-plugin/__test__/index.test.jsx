const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitor = require('../visitor');

function transformToStyles(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  traverse(ast, visitor);

  // generate code <- ast
  const output = generate(ast, code);
  return output.code;
}

describe('test babel transform plugin', () => {
  it('generates styled component', () => {
    const code = `
      const StyledText = styled(Text, {
        padding: { '@base': 30, '@md': 90, '@xl': 5 },
        backgroundColor: "$colors.indigo.500",
        variants: {
          color: {
            blue: {
              color: "white",
            },
            indigo: {
              color: "black",
            },
          },
          checked: {
            true: {
              color: "white",
            },
          },
          size: {
            md: {
              padding: 10,
            },
          },
        },
      });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('generates styled component for baseStyle', () => {
    const code = `
    const StyledPressable = styled(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.blue.800",
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('verifies base hover styles', () => {
    const code = `
    const StyledPressable = styled(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.blue.800",
      _hover: {
        backgroundColor: "$colors.hover",
      },
      variants: {
        color: {
          gray: {
          backgroundColor: "$colors.gray",
          }
        }
      }
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('verifies base pressed styles', () => {
    const code = `
    const StyledPressable = styled(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.primary",
      _pressed: {
        backgroundColor: "$colors.pressed",
      },
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('verifies base/variants pressed styles', () => {
    const code = `
    const StyledPressable = styled(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.primary",
      _pressed: {
        backgroundColor: "$colors.pressed",
      },
      variants: {
        checked: {
          true: {
            _pressed: {
              backgroundColor: "$colors.pressed_checked",
            },
          }
        }
      }
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('verifies base focus styles', () => {
    const code = `
    const StyledPressable = styled(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.primary",
      _focus: {
        backgroundColor: "$colors.pressed",
      },
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('verifies base focus styles', () => {
    const code = `
    const StyledPressable = styled(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.primary",
      _focus: {
        backgroundColor: "$colors.pressed",
      },
      variants: {
        checked: {
          true: {
            _focus: {
              backgroundColor: "$colors.pressed_checked",
            },
          }
        }
      }
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });
});
