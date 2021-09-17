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

function AppContainer() {
  const [darkMode, setDarkMode] = useState(true);
  // useEffect(() => {
  //   setInterval(() => {
  //     setDarkMode((m) => !m);
  //   }, 5000);
  // }, []);
  // useEffect(() => {
  //   if (darkMode) {
  //     setTheme({
  //       ...theme,
  //       colors: {
  //         ...theme.colors,
  //         ...darkColors,
  //       },
  //     });
  //   } else {
  //     setTheme({
  //       ...theme,
  //       colors: {
  //         ...theme.colors,
  //         ...lightColors,
  //       },
  //     });
  //   }
  // }, [darkMode, setTheme]);
  const x = 1;
  return (
    <Container>
      <ScrollView
        sx={{
          backgroundColor: '$colors.rose.200',
          flex: x,
          alignItems: {"@sm":'center'},
        }}
        style={{flexDirection: "row"}}
      >
        <Text>Hello from scrollview</Text>
      </ScrollView>
      <View
        sx={{
          backgroundColor: '$colors.rose.50',
          flex: 1,
          alignItems: 'center',
        }}
        nativeID="122"
      >
        <StyledComponentsButton />
        <VariantButton />
        {/* <VariantButton />
        <VariantButton />
        <VariantButton />
        <VariantButton />
        <VariantButton /> */}
      </View>
    </Container>
  );
}
`);
