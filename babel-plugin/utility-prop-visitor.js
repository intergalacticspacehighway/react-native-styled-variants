const template = require('@babel/template').default;
const t = require('@babel/types');
const { addNamespace, addNamed } = require('@babel/helper-module-imports');

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

let visitor = {
  Program(path) {
    root = path;
    importsAdded = false;
  },
  FunctionDeclaration(path) {
    // Put check if starts with capital name to make sure it's a react component!

    let count = 0;
    const getStyleId = () => {
      count++;
      return count.toString();
    };

    let hasThemeStyles = false;
    let hasResponsiveStyles = false;
    let themeIdentifier = path.scope.generateUidIdentifier('theme');
    let breakPointIdentifier =
      path.scope.generateUidIdentifier('currentBreakpoint');
    let foundSXAttribute = false;
    let styleSheetIdentifier = path.scope.generateUidIdentifier('styleSheet');

    let styleSheet = t.objectExpression([]);

    path.traverse({
      JSXOpeningElement(jsxPath) {
        // If sx or contentContainerSX includes variables, we'll not memoize it for now!
        let containsVariables = false;

        const sxAttributes = jsxPath
          .get('attributes')
          .filter(
            (attr) =>
              attr.node.name.name === 'sx' ||
              attr.node.name.name === 'contentContainerSX'
          );

        sxAttributes.forEach((sxAttribute) => {
          const styleAttributeName = attrMaps[sxAttribute.node.name.name];
          const styleAttribute = jsxPath
            .get('attributes')
            .filter((attr) => attr.node.name.name === styleAttributeName)[0];

          if (sxAttribute) {
            foundSXAttribute = true;
            if (
              t.isJSXExpressionContainer(sxAttribute.node.value) &&
              t.isObjectExpression(sxAttribute.node.value.expression)
            ) {
              const styleId = getStyleId();

              sxAttribute.traverse({
                ObjectProperty: {
                  enter(path) {
                    // If at any point we come across a variable in styles
                    if (t.isIdentifier(path.node.value)) {
                      containsVariables = true;
                    }
                    // Converts $color.yellow => theme['color']['yellow']
                    if (t.isStringLiteral(path.node.value)) {
                      const literalNode = path.node.value;
                      // convert $colors.blue.500 => theme["blue"]["500"]
                      if (literalNode.value.includes('$')) {
                        hasThemeStyles = true;

                        const tokens = literalNode.value
                          .replace('$', themeIdentifier.name + '.')
                          .split('.');
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

                        path.node.value = tokenMemberExpression;
                      }
                    }

                    // Converts {"@sm": 20, "@base": 10} => getClosestBreakpointValue({sm: 20, base: 10}, currentBreakpoint);
                    else if (t.isObjectExpression(path.node.value)) {
                      const objectExpressionNode = path.node.value;

                      if (
                        objectExpressionNode.properties.some((p) => {
                          return (
                            p.key && p.key.value && p.key.value.includes('@')
                          );
                        })
                      ) {
                        hasResponsiveStyles = true;

                        objectExpressionNode.properties.forEach(
                          (p) =>
                            (p.key = t.stringLiteral(
                              p.key.value.replace('@', '')
                            ))
                        );

                        path.node.value = t.callExpression(
                          t.identifier('getClosestResponsiveValue'),
                          [objectExpressionNode, breakPointIdentifier]
                        );
                      }
                    }
                  },
                },
              });
              const styleExpression = sxAttribute.node.value.expression;

              let newStyleValue;
              // If contains a variable, add inline object instead of creating stylesheet
              if (containsVariables) {
                newStyleValue = sxAttribute.node.value.expression;
              } else {
                // Append style expression to function level stylesheet object
                styleSheet = t.objectExpression([
                  ...styleSheet.properties,
                  t.objectProperty(t.identifier(styleId), styleExpression),
                ]);

                newStyleValue = t.memberExpression(
                  styleSheetIdentifier,
                  t.stringLiteral(styleId),
                  true
                );
              }

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
              else if (
                t.isObjectExpression(styleAttribute.node.value.expression)
              ) {
                styleAttribute.node.value.expression = t.arrayExpression([
                  newStyleValue,
                  styleAttribute.node.value.expression,
                ]);
              }
              // Case 3 - style is array. style={[{margin: 10}]} => style={[styleSheet['1'], {margin:10}]}
              else if (
                t.isArrayExpression(styleAttribute.node.value.expression)
              ) {
                styleAttribute.node.value.expression.elements.unshift(
                  newStyleValue
                );
              }
            }
          }
        });
      },
    });

    if (!importsAdded && foundSXAttribute) {
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
      if (hasThemeStyles) {
        memoArray.push(themeIdentifier);
      }
      if (hasResponsiveStyles) {
        memoArray.push(breakPointIdentifier);
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

    if (hasThemeStyles) {
      path.get('body').unshiftContainer(
        'body',
        buildThemeTemplate({
          THEME_IDENTIFIER: themeIdentifier,
          PACKAGE_NAME_SPACE: packageNameSpace,
        })
      );
    }

    if (hasResponsiveStyles) {
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
