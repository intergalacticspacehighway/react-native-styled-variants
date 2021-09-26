const template = require('@babel/template').default;
const t = require('@babel/types');
const { addNamespace, addNamed } = require('@babel/helper-module-imports');

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
    packageNameSpace = '';
    styleSheetNameSpace = '';
    reactNameSpace = '';
  },
  'FunctionDeclaration|ArrowFunctionExpression'(path) {
    // Put check if starts with capital name to make sure it's a react component!

    let count = 0;
    const getStyleId = () => {
      count++;
      return count.toString();
    };

    let hasThemeToken = false;
    let hasResponsiveToken = false;
    let hasThemeStyleSheet = false;
    let hasResponsiveStyleSheet = false;
    let themeIdentifier = path.scope.generateUidIdentifier('theme');
    let breakPointIdentifier =
      path.scope.generateUidIdentifier('currentBreakpoint');
    const resolveResponsiveValueMemberExpression = t.memberExpression(
      breakPointIdentifier,
      t.identifier('resolveResponsiveValue')
    );

    let foundSXAttribute = false;
    let styleSheetIdentifier = path.scope.generateUidIdentifier('styleSheet');

    let styleSheet = t.objectExpression([]);

    path.traverse({
      JSXOpeningElement(jsxPath) {
        // If sx or contentContainerSX includes variables, we'll not memoize it for now!
        let containsVariables = false;

        const jsxAttributes = jsxPath
          .get('attributes')
          .filter((attr) => t.isJSXAttribute(attr.node));

        const sxAttributes = jsxAttributes.filter(
          (attr) =>
            attr.node.name.name === 'sx' ||
            attr.node.name.name === 'contentContainerSX'
        );

        // If const App = (props) => <View sx={{color: "red"}} />
        // convert it to
        // const App = (props) => {
        // return <View sx={{color: "red"}} />
        // }
        if (sxAttributes.length > 0 && t.isJSXElement(path.node.body)) {
          path
            .get('body')
            .replaceWith(t.blockStatement([t.returnStatement(path.node.body)]));
        }

        sxAttributes.forEach((sxAttribute) => {
          let newStyleValue;
          const styleAttributeName = attrMaps[sxAttribute.node.name.name];

          const newJSXAttributes = jsxPath
            .get('attributes')
            .filter((attr) => t.isJSXAttribute(attr.node));

          const styleAttribute = newJSXAttributes.find(
            (attr) => attr.node.name.name === styleAttributeName
          );

          if (
            t.isJSXExpressionContainer(sxAttribute.node.value) &&
            t.isObjectExpression(sxAttribute.node.value.expression)
          ) {
            // Search for variables in sx attribute expression properties. e.g. sx={{margin: x}}
            sxAttribute.traverse({
              ObjectProperty(path) {
                if (t.isIdentifier(path.node.value)) {
                  containsVariables = true;
                }
              },
            });
          }

          sxAttribute.traverse({
            // Replace Theme tokens - '$colors.blue' => theme['colors']['blue']
            StringLiteral(path) {
              if (path.node.value.includes('$')) {
                hasThemeToken = true;
                path.replaceWith(
                  getThemeTokenFromThemeLiteral(path.node, themeIdentifier)
                );
              }
            },
          });

          // Converts {sm: 20, base: 10} => resolveResponsiveValue({sm: 20, base: 10});
          // Responsive values
          sxAttribute.traverse({
            ObjectExpression(path) {
              if (
                path.node.properties.some((p) => {
                  return p.key && p.key.value && p.key.value.includes('@');
                })
              ) {
                hasResponsiveToken = true;

                // Converts "@sm" to "sm"
                path.node.properties.forEach(
                  (p) => (p.key = t.stringLiteral(p.key.value.replace('@', '')))
                );

                path.replaceWith(
                  t.callExpression(resolveResponsiveValueMemberExpression, [
                    path.node,
                  ])
                );
              }
            },
          });

          // Case sx={{margin: 10}}
          if (
            t.isJSXExpressionContainer(sxAttribute.node.value) &&
            t.isObjectExpression(sxAttribute.node.value.expression)
          ) {
            const styleId = getStyleId();

            // If contains a variable, add inline object instead of creating stylesheet
            if (containsVariables) {
              newStyleValue = sxAttribute.node.value.expression;
            } else {
              // Append style expression to function level stylesheet object
              styleSheet.properties.push(
                t.objectProperty(
                  t.identifier(styleId),
                  sxAttribute.node.value.expression
                )
              );

              if (hasThemeToken) {
                hasThemeStyleSheet = true;
              }
              if (hasResponsiveToken) {
                hasResponsiveStyleSheet = true;
              }

              newStyleValue = t.memberExpression(
                styleSheetIdentifier,
                t.stringLiteral(styleId),
                true
              );
            }
          }
          // Case: sx={pressed ?  {color: white} :  undefined }
          else if (t.isJSXExpressionContainer(sxAttribute.node.value)) {
            newStyleValue = sxAttribute.node.value.expression;
          }

          if (newStyleValue) {
            foundSXAttribute = true;

            // Remove sx attribute
            sxAttribute.remove();

            // Modify style attribute
            // Case 1 - no style attribute
            if (!styleAttribute) {
              jsxPath.node.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier(styleAttributeName),
                  t.jsxExpressionContainer(newStyleValue)
                )
              );
            }
            // Case 2 - style is object. style={{margin: 10}} => style={[styleSheet['1'], {margin:10}]}
            // Case 3 - style is a identifier style={style} => style={[styleSheet['1'], style]}
            // Case 4- style is a member expression style={style.y} => style={[styleSheet['1'], style]}
            // Case 5- style is a member expression style={x ? style.y : y} => style={[styleSheet['1'], x ? style.y : y]}
            else if (
              t.isObjectExpression(styleAttribute.node.value.expression) ||
              t.isIdentifier(styleAttribute.node.value.expression) ||
              t.isMemberExpression(styleAttribute.node.value.expression) ||
              t.isConditionalExpression(styleAttribute.node.value.expression)
            ) {
              styleAttribute.node.value.expression = t.arrayExpression([
                newStyleValue,
                styleAttribute.node.value.expression,
              ]);
            }
            // Case 5 - style is array. style={[{margin: 10}]} => style={[styleSheet['1'], {margin:10}]}
            else if (
              t.isArrayExpression(styleAttribute.node.value.expression)
            ) {
              styleAttribute.node.value.expression.elements.unshift(
                newStyleValue
              );
            }
            // Case 6 - style is a identifier style={style} => style={[styleSheet['1'], style]}
            else if (t.isIdentifier(styleAttribute.node.value.expression)) {
              styleAttribute.node.value.expression = t.arrayExpression([
                newStyleValue,
                styleAttribute.node.value.expression,
              ]);
            }
          }
        });
      },
    });

    if (styleSheet.properties.length) {
      let memoArray = [];
      if (hasThemeStyleSheet) {
        memoArray.push(themeIdentifier);
      }
      if (hasResponsiveStyleSheet) {
        memoArray.push(resolveResponsiveValueMemberExpression);
      }

      if (!reactNameSpace) {
        // Adds import * as Y from "react"
        reactNameSpace = addNamespace(root, 'react', {
          nameHint: PACKAGE_NAMESPACE_HINT + '_react',
        }).name;
      }

      if (!styleSheetNameSpace) {
        styleSheetNameSpace = addNamed(root, 'StyleSheet', 'react-native', {
          nameHint: PACKAGE_NAMESPACE_HINT + '_styleSheet',
        }).name;
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
      if (!packageNameSpace) {
        // Adds import * as X from "package"
        packageNameSpace = addNamespace(root, source, {
          nameHint: PACKAGE_NAMESPACE_HINT,
        }).name;
      }

      path.get('body').unshiftContainer(
        'body',
        buildThemeTemplate({
          THEME_IDENTIFIER: themeIdentifier,
          PACKAGE_NAME_SPACE: packageNameSpace,
        })
      );
    }

    if (hasResponsiveToken) {
      if (!packageNameSpace) {
        // Adds import * as X from "package"
        packageNameSpace = addNamespace(root, source, {
          nameHint: PACKAGE_NAMESPACE_HINT,
        }).name;
      }

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
