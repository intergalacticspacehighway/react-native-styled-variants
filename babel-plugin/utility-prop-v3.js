const template = require('@babel/template').default;
const t = require('@babel/types');
const { addNamespace, addNamed } = require('@babel/helper-module-imports');
const generate = require('@babel/generator').default;
const utilityProps = require('./utility-props');

let importsAdded = false;
let packageNameSpace = '';
let styleSheetNameSpace = '';
let reactNameSpace = '';
let root;
const buildThemeTemplate = template(
  'const THEME_IDENTIFIER = PACKAGE_NAME_SPACE.useTheme().theme;'
);
const buildBreakPointTemplate = template(
  'const BREAKPOINT_IDENTIFIER = PACKAGE_NAME_SPACE.useCurrentBreakpoint();'
);

const source = 'react-native-styled-variants';

const PACKAGE_NAMESPACE_HINT = '_rnStyledVariants_';

const attrMaps = {
  sx: 'style',
  contentContainerSX: 'contentContainerStyle',
};

const getThemeTokenFromThemeLiteral = (node, themeIdentifier) => {
  const tokens = node.value.replace('$', themeIdentifier.name + '.').split('.');
  const token = tokens.shift();
  const property = tokens.shift();
  let tokenMemberExpression = t.memberExpression(
    t.identifier(token),
    t.stringLiteral(property),
    true
  );
  while (tokens.length) {
    const property = tokens.shift();
    tokenMemberExpression = t.memberExpression(
      tokenMemberExpression,
      t.stringLiteral(property),
      true
    );
  }
  return tokenMemberExpression;
};

let visitor = {
  'Program'(path) {
    root = path;
    importsAdded = false;
  },
  'FunctionDeclaration|ArrowFunctionExpression'(path) {
    // Put check if starts with capital name to make sure it's a react component!

    let count = 0;
    const getStyleId = () => {
      count++;
      return count.toString();
    };

    let hasThemeToken = false;
    let hasThemeStyleSheet = false;
    let hasResponsiveToken = false;
    let hasResponsiveStyleSheet = false;
    let themeIdentifier = path.scope.generateUidIdentifier('theme');
    let breakPointIdentifier =
      path.scope.generateUidIdentifier('currentBreakpoint');
    const resolveResponsiveValueMemberExpression = t.memberExpression(
      breakPointIdentifier,
      t.identifier('resolveResponsiveValue')
    );

    let foundUtilityAttrs = false;
    let styleSheetIdentifier = path.scope.generateUidIdentifier('styleSheet');

    let styleSheet = t.objectExpression([]);

    path.traverse({
      JSXOpeningElement(jsxPath) {
        const jsxAttributes = jsxPath
          .get('attributes')
          .filter((attr) => t.isJSXAttribute(attr.node));

        let styleAttribute = jsxAttributes.find(
          (attr) => attr.node.name.name === 'style'
        );

        const utilityAttrs = jsxAttributes.filter(
          (attr) => utilityProps[attr.node.name.name]
        );

        if (utilityAttrs.length > 0) {
          let styleId = getStyleId();
          foundUtilityAttrs = true;

          // Construct a style object
          // Case 1 - Literals
          // <View mt={5} /> => <View style={styleSheet['1']} />
          // Case 2 - Variables
          // <View mt={x} mx={4} /> => <View style={[styleSheet, {marginTop: x}]} />
          // Case 3 - Literals + existing style object
          // <View mt={5} style={style} /> => <View style={[styleSheet['1], style]} />
          // Case 4 - Literals + constants + existing style object
          // <View mt={x} mx={4} style={style} /> => <View style={[styleSheet['1'], {marginTop: x}, style]} />

          let styleSheetStyle = t.objectExpression([]);
          let variableStyles = t.objectExpression([]);

          utilityAttrs.forEach((prop) => {
            let actualPropName = prop.node.name.name;
            if (typeof utilityProps[actualPropName] === 'string') {
              actualPropName = utilityProps[actualPropName];
            }

            // Case : mt="3"
            if (t.isLiteral(prop.node.value)) {
              // Theme token is used in literal prop. Convert $colors.500 to theme['colors']['500']
              if (
                t.isStringLiteral(prop.node.value) &&
                prop.node.value.value.includes('$')
              ) {
                hasThemeToken = true;
                hasThemeStyleSheet = true;
                prop.node.value = getThemeTokenFromThemeLiteral(
                  prop.node.value,
                  themeIdentifier
                );
              }

              styleSheetStyle.properties.push(
                t.objectProperty(t.identifier(actualPropName), prop.node.value)
              );
            }
            // Case : mt={x}
            else if (t.isIdentifier(prop.node.value.expression)) {
              variableStyles.properties.push(
                t.objectProperty(
                  t.identifier(actualPropName),
                  prop.node.value.expression
                )
              );
            }
            // Case : mt={'5'}
            else if (t.isLiteral(prop.node.value.expression)) {
              // Theme token is used in literal prop. Convert $colors.500 to theme['colors']['500']
              if (
                t.isStringLiteral(prop.node.value.expression) &&
                prop.node.value.expression.value.includes('$')
              ) {
                hasThemeToken = true;
                hasThemeStyleSheet = true;
                prop.node.value.expression = getThemeTokenFromThemeLiteral(
                  prop.node.value.expression,
                  themeIdentifier
                );
              }

              styleSheetStyle.properties.push(
                t.objectProperty(
                  t.identifier(actualPropName),
                  prop.node.value.expression
                )
              );
            }
            // Case : mt={{"@sm": 6}}
            else if (t.isObjectExpression(prop.node.value.expression)) {
              const objectExpressionNode = prop.node.value.expression;

              if (
                objectExpressionNode.properties.some((p) => {
                  return p.key && p.key.value && p.key.value.includes('@');
                })
              ) {
                hasResponsiveToken = true;
                let responsiveStyleIncludesVariable = false;
                // Replace '@sm' => 'sm'
                objectExpressionNode.properties.forEach((p) => {
                  p.key = t.stringLiteral(p.key.value.replace('@', ''));

                  if (t.isIdentifier(p.value)) {
                    responsiveStyleIncludesVariable = true;
                  }
                  // If utility prop is a literal
                  else if (t.isLiteral(p.value)) {
                    // Theme token is used in literal prop. Convert $colors.500 to theme['colors']['500']
                    if (
                      t.isStringLiteral(p.value) &&
                      p.value.value.includes('$')
                    ) {
                      hasThemeToken = true;
                      p.value = getThemeTokenFromThemeLiteral(
                        p.value,
                        themeIdentifier
                      );
                    }
                  }
                });

                prop.node.value.expression = t.callExpression(
                  resolveResponsiveValueMemberExpression,
                  [objectExpressionNode]
                );

                if (responsiveStyleIncludesVariable) {
                  variableStyles.properties.push(
                    t.objectProperty(
                      t.identifier(actualPropName),
                      prop.node.value.expression
                    )
                  );
                } else {
                  styleSheetStyle.properties.push(
                    t.objectProperty(
                      t.identifier(actualPropName),
                      prop.node.value.expression
                    )
                  );
                  if (hasResponsiveToken) {
                    hasResponsiveStyleSheet = true;
                  }
                  if (hasThemeToken) {
                    hasThemeStyleSheet = true;
                  }
                }
              }
              // Might be shadowOffset
              else {
                variableStyles.properties.push(
                  t.objectProperty(
                    t.identifier(actualPropName),
                    objectExpressionNode
                  )
                );
              }
            }
            // Remove the utility prop
            prop.remove();
          });

          const hasVariableStyles = variableStyles.properties.length > 0;
          const hasStyleSheetStyles = styleSheetStyle.properties.length > 0;

          let styleSheetMemberExpression = hasStyleSheetStyles
            ? t.memberExpression(
                styleSheetIdentifier,
                t.stringLiteral(styleId),
                true
              )
            : undefined;

          if (!styleAttribute) {
            let newStyle;
            if (styleSheetMemberExpression && hasVariableStyles) {
              newStyle = [styleSheetMemberExpression, variableStyles];
            } else if (styleSheetMemberExpression) {
              newStyle = styleSheetMemberExpression;
            } else {
              newStyle = variableStyles;
            }

            if (Array.isArray(newStyle)) {
              jsxPath.node.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('style'),
                  t.jsxExpressionContainer(t.arrayExpression(newStyle))
                )
              );
            } else {
              jsxPath.node.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('style'),
                  t.jsxExpressionContainer(newStyle)
                )
              );
            }
          }
          // Case 2 - style is object. style={{margin: 10}} => style={[styleSheet['1'], {margin:10}]}
          // Case 3 - style is a identifier style={style} => style={[styleSheet['1'], style]}
          else if (
            t.isObjectExpression(styleAttribute.node.value.expression) ||
            t.isIdentifier(styleAttribute.node.value.expression)
          ) {
            let styleArrayValues = [];

            if (hasVariableStyles) {
              styleArrayValues.unshift(variableStyles);
            }

            if (styleSheetMemberExpression) {
              styleArrayValues.unshift(styleSheetMemberExpression);
            }

            styleAttribute.node.value.expression = t.arrayExpression([
              ...styleArrayValues,
              styleAttribute.node.value.expression,
            ]);
          }
          // Case 4 - style is array. style={[{margin: 10}]} => style={[styleSheet['1'], {margin:10}]}
          else if (t.isArrayExpression(styleAttribute.node.value.expression)) {
            if (hasVariableStyles) {
              styleAttribute.node.value.expression.elements.unshift(
                variableStyles
              );
            }

            if (styleSheetMemberExpression) {
              styleAttribute.node.value.expression.elements.unshift(
                styleSheetMemberExpression
              );
            }
          }

          // Append to function level styleSheet object
          if (styleSheetStyle.properties.length > 0) {
            styleSheet = t.objectExpression([
              ...styleSheet.properties,
              t.objectProperty(t.identifier(styleId), styleSheetStyle),
            ]);
          }
        }
      },
    });

    if (!importsAdded && foundUtilityAttrs) {
      // Adds import * as X from "package"
      packageNameSpace = addNamespace(root, source, {
        nameHint: PACKAGE_NAMESPACE_HINT,
      }).name;
      styleSheetNameSpace = addNamed(root, 'StyleSheet', 'react-native', {
        nameHint: PACKAGE_NAMESPACE_HINT + '_styleSheet',
      }).name;
      // Adds import * as Y from "react"
      reactNameSpace = addNamespace(root, 'react', {
        nameHint: PACKAGE_NAMESPACE_HINT + '_react',
      }).name;
      importsAdded = true;
    }

    if (styleSheet.properties.length) {
      let memoArray = [];
      if (hasThemeStyleSheet) {
        memoArray.push(themeIdentifier);
      }
      if (hasResponsiveStyleSheet) {
        memoArray.push(resolveResponsiveValueMemberExpression);
      }
      const styleSheetMemoized = t.callExpression(
        t.memberExpression(
          t.identifier(reactNameSpace),
          t.identifier('useMemo')
        ),
        [
          t.arrowFunctionExpression(
            [],
            t.callExpression(
              t.memberExpression(
                t.identifier(styleSheetNameSpace),
                t.identifier('create')
              ),
              [styleSheet]
            )
          ),
          t.arrayExpression(memoArray),
        ]
      );

      path
        .get('body')
        .unshiftContainer(
          'body',
          t.variableDeclaration('const', [
            t.variableDeclarator(styleSheetIdentifier, styleSheetMemoized),
          ])
        );
    }

    if (hasThemeToken) {
      path.get('body').unshiftContainer(
        'body',
        buildThemeTemplate({
          THEME_IDENTIFIER: themeIdentifier,
          PACKAGE_NAME_SPACE: packageNameSpace,
        })
      );
    }

    if (hasResponsiveToken) {
      path.get('body').unshiftContainer(
        'body',
        buildBreakPointTemplate({
          BREAKPOINT_IDENTIFIER: breakPointIdentifier,
          PACKAGE_NAME_SPACE: packageNameSpace,
        })
      );
    }
  },
};

module.exports = visitor;
