const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitor = require('../visitor');
const utilityPropVisitor = require('../utility-prop-visitor');

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
  return output.code;
}

describe('test createVariant transform plugin', () => {
  it('generates styled component', () => {
    const code = `
      const StyledText = createVariant(Text, {
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
    const StyledPressable = createVariant(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.blue.800",
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('verifies base hover styles', () => {
    const code = `
    const StyledPressable = createVariant(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.blue.800",
      _hovered: {
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
    const StyledPressable = createVariant(Pressable, {
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
    const StyledPressable = createVariant(Pressable, {
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
    const StyledPressable = createVariant(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.primary",
      _focused: {
        backgroundColor: "$colors.pressed",
      },
    });
    `;
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  });

  it('verifies base focus styles', () => {
    const code = `
    const StyledPressable = createVariant(Pressable, {
      padding: "$space.3",
      backgroundColor: "$colors.primary",
      _focused: {
        backgroundColor: "$colors.pressed",
      },
      variants: {
        checked: {
          true: {
            _focused: {
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

describe('test sx transform plugin', () => {
  it("creates memoized stylesheet without dependency array", () => {
    const code = `
      const App = () => {
        return <View sx={{margin: 10, padding: 20}} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("creates memoized stylesheet with theme dependency", () => {
    const code = `
      const App = () => {
        return <View sx={{margin: '$colors.blue', padding: 20}} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("creates memoized stylesheet with responsive breakpoint dependency", () => {
    const code = `
      const App = () => {
        return <View sx={{margin: '$colors.blue', padding: {'@sm': 20, '@base': 10} }} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("creates memoized stylesheet and updates existing style property", () => {
    const code = `
      const App = () => {
        return <View sx={{margin: '$colors.blue', padding: {'@sm': 20, '@base': 10} }} style={{margin: 10}} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("creates memoized stylesheet and updates existing style array property", () => {
    const code = `
      const App = () => {
        return <View sx={{margin: '$colors.blue', padding: {'@sm': 20, '@base': 10} }} style={[{margin: 10}]} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("adds conditional sx property in style", () => {
    const code = `
      const App = () => {
        const pressed = false;
        return <View sx={pressed ? {backgroundColor: '$colors.blue'} : {}} style={[{margin: 10}]} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("verifies contentContainerSX prop gets appended to contentContainerStyle prop", () => {
    const code = `
      const App = () => {
        const pressed = false;
        return <ScrollView contentContainerSX={{backgroundColor: '$colors.blue'}} style={[{margin: 10}]} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("verifies sx is added inline when it contains variable", () => {
    const code = `
      const App = () => {
        const a = 10;
        return <View sx={{padding: a}} style={[{margin: 10}]} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("verifies sx is added inline when it contains variable - conditional", () => {
    const code = `
      const App = () => {
        const a = 10;
        return <View sx={a ? {color: "black"} : {}} style={[{margin: 10}]} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("verifies sx is added inline when it contains variable in responsive value", () => {
    const code = `
      const App = () => {
        const a = 'black';
        return <View sx={{color: {"@sm" : a} }} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("verifies sx and contentContainerStyle resolves to respective style props", () => {
    const code = `
      const App = () => {
        return <View sx={{color: "pink"}} contentContainerSX={{margin: 10}} />
      }
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("arrow function short hand component definition", () => {
    const code = `
      const App = () => <View sx={{color: "pink"}} contentContainerSX={{margin: 10}} />
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })

  it("verify shadow object is added to stylesheet", () => {
    const code = `
      const App = () => <View sx={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 2,
      }} />
    `
    const output = transformToStyles(code);
    expect(output).toMatchSnapshot();
  })
})