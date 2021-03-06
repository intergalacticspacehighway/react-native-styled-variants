const template = require('@babel/template').default;
const t = require('@babel/types');
const { addNamespace } = require('@babel/helper-module-imports');
const { getComponentId } = require('./hash');

const source = 'react-native-styled-variants';

const PACKAGE_NAMESPACE_HINT = '_rnStyledVariants_';

const hoverPropName = '_hovered';
const focusPropName = '_focused';
const pressPropName = '_pressed';

let root;
let packageNameSpace = '';
let reactNameSpace = '';
const visitor = {
  Program(path) {
    root = path;
    packageNameSpace = '';
    reactNameSpace = '';
  },
  // Traverse for call expression beginning with `styled()`
  CallExpression(path, state) {
    if (path.node.callee.name === 'createVariant') {
      if (!packageNameSpace) {
        // Adds import * as X from "package"
        packageNameSpace = addNamespace(root, source, {
          nameHint: PACKAGE_NAMESPACE_HINT,
        }).name;
      }

      if (!reactNameSpace) {
        // Adds import * as Y from "react"
        reactNameSpace = addNamespace(root, 'react', {
          nameHint: PACKAGE_NAMESPACE_HINT + '_react',
        }).name;
      }

      let hasResponsiveStyles = false;
      let hasThemeStyles = false;
      let hasVariants = false;
      let hasVariantsHoverStyles = false;
      let hasBaseHoverStyles = false;

      let hasVariantsPressedStyles = false;
      let hasBasePressedStyles = false;

      let hasVariantsFocusStyles = false;
      let hasBaseFocusStyles = false;

      const variantsIdentifier = [];

      const [componentIdentifier, styleObjectExpression] = path.node.arguments;
      // Variants object
      const variants = styleObjectExpression.properties.find(
        (prop) => prop.key.name === 'variants'
      );

      // Default variants object
      const defaultVariants = styleObjectExpression.properties.find(
        (prop) => prop.key.name === 'defaultVariants'
      );

      // Base style properties
      const baseStyleProperties = styleObjectExpression.properties
        .filter((prop) => prop.key.name !== 'variants')
        .filter((p) => p.key.name !== 'defaultVariants')
        .filter((p) => p.key.name !== hoverPropName)
        .filter((p) => p.key.name !== focusPropName)
        .filter((p) => p.key.name !== pressPropName);

      // Base hover style property.
      const baseHoverStyleProperty = styleObjectExpression.properties.filter(
        (p) => p.key.name === hoverPropName
      )[0];

      // Base pressed style property.
      const basePressedStyleProperty = styleObjectExpression.properties.filter(
        (p) => p.key.name === pressPropName
      )[0];

      // Base focus style property.
      const baseFocusStyleProperty = styleObjectExpression.properties.filter(
        (p) => p.key.name === focusPropName
      )[0];

      // Empty style properties. We'll start filling it from scratch
      // To convert {backgroundColor:"white", variants: {a : {b : {}}}} => { baseStyle: {}, a_b: {} }
      styleObjectExpression.properties = [];

      // Flattens base hover styles
      // Converts {_hovered: {}} => {baseStyle_hovered: {}}
      if (baseHoverStyleProperty) {
        hasBaseHoverStyles = true;
        styleObjectExpression.properties.push(
          t.objectProperty(
            t.identifier(`baseStyle${hoverPropName}`),
            baseHoverStyleProperty.value
          )
        );
      }

      // Flattens base pressed styles
      // Converts {_pressed: {}} => {baseStyle_pressed: {}}
      if (basePressedStyleProperty) {
        hasBasePressedStyles = true;
        styleObjectExpression.properties.push(
          t.objectProperty(
            t.identifier(`baseStyle${pressPropName}`),
            basePressedStyleProperty.value
          )
        );
      }

      // Flattens base pressed styles
      // Converts {_focused: {}} => {baseStyle_focused: {}}
      if (baseFocusStyleProperty) {
        hasBaseFocusStyles = true;
        styleObjectExpression.properties.push(
          t.objectProperty(
            t.identifier(`baseStyle${focusPropName}`),
            baseFocusStyleProperty.value
          )
        );
      }

      // Converts {backgroundColor: "white"} => {baseStyle: {backgroundColor: "white"}}
      styleObjectExpression.properties.push(
        t.objectProperty(
          t.identifier('baseStyle'),
          t.objectExpression(baseStyleProperties)
        )
      );

      // **Below code flattens variant styles**
      // {
      //   variants: {
      //     color: {
      //       gray: {},
      //     },
      //   },
      // }
      // **to**
      // {
      //   color_gray: {}
      // }
      if (variants) {
        hasVariants = true;
        // Variants  {checked: {true: {backgroundColor:"x", _hovered: {backgroundColor: "y"}}}}
        [...variants.value.properties].forEach((variantProp, index) => {
          const variantName = variantProp.key.name;
          variantsIdentifier.push(variantName);
          variantProp.value.properties.forEach((nestedVariant) => {
            const variantValueName = t.isLiteral(nestedVariant.key)
              ? nestedVariant.key.value
              : nestedVariant.key.name;

            const variantHoverObjectProperty =
              nestedVariant.value.properties.filter((p) => {
                return p.key.name === hoverPropName;
              })[0];

            const variantPressedObjectProperty =
              nestedVariant.value.properties.filter((p) => {
                return p.key.name === pressPropName;
              })[0];

            const variantFocusObjectProperty =
              nestedVariant.value.properties.filter((p) => {
                return p.key.name === focusPropName;
              })[0];

            // Remove _hovered from nested variant props i.i
            nestedVariant.value.properties = nestedVariant.value.properties
              .filter((p) => p.key.name !== hoverPropName)
              .filter((p) => p.key.name !== focusPropName)
              .filter((p) => p.key.name !== pressPropName);

            if (variantHoverObjectProperty) {
              hasVariantsHoverStyles = true;
              const variantHoverId = t.identifier(
                variantName + '_' + variantValueName + hoverPropName
              );
              styleObjectExpression.properties.push(
                t.objectProperty(
                  variantHoverId,
                  variantHoverObjectProperty.value
                )
              );
            }

            if (variantFocusObjectProperty) {
              hasVariantsFocusStyles = true;
              const variantFocusId = t.identifier(
                variantName + '_' + variantValueName + focusPropName
              );
              styleObjectExpression.properties.push(
                t.objectProperty(
                  variantFocusId,
                  variantFocusObjectProperty.value
                )
              );
            }

            if (variantPressedObjectProperty) {
              hasVariantsPressedStyles = true;
              const variantPressedId = t.identifier(
                variantName + '_' + variantValueName + pressPropName
              );
              styleObjectExpression.properties.push(
                t.objectProperty(
                  variantPressedId,
                  variantPressedObjectProperty.value
                )
              );
            }

            // After removing _hovered, _pressed append rest flattened styles in styleObjectExpression
            const newId = t.identifier(variantName + '_' + variantValueName);
            styleObjectExpression.properties.push(
              t.objectProperty(newId, nestedVariant.value)
            );
          });
        });
      }

      // Converts {sm: 20, base: 10} => getClosestBreakpointValue({sm: 20, base: 10}, currentBreakpoint);
      const breakpointReplacePath = [];
      // Traverse object expression whose properties has '@' breakpoint property in it.
      path.traverse({
        ObjectExpression: {
          enter(path) {
            if (
              path.node.properties.some((p) => {
                return p.key && p.key.value && p.key.value.includes('@');
              })
            ) {
              path.node.properties.forEach(
                (p) => (p.key = t.stringLiteral(p.key.value.replace('@', '')))
              );

              hasResponsiveStyles = true;

              breakpointReplacePath.push({
                path,
                value: t.callExpression(
                  t.identifier('getClosestResponsiveValue'),
                  [path.node, t.identifier('currentBreakpoint')]
                ),
              });
            }
          },
        },
      });

      // Do replacement outside or else it can cause max callstack. ToDo - find alternate approach
      breakpointReplacePath.forEach((v) => {
        v.path.replaceWith(v.value);
      });

      // Converts $color.yellow => theme.color.yellow
      path.traverse({
        StringLiteral: {
          enter(path) {
            // convert $colors.blue.500 => theme["blue"]["500"]
            if (path.node.value.includes('$')) {
              hasThemeStyles = true;

              const tokens = path.node.value.replace('$', 'theme.').split('.');
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

              path.replaceWith(tokenMemberExpression);
            }
          },
        },
      });

      const hasHoverStyles = hasBaseHoverStyles || hasVariantsHoverStyles;
      const hasPressedStyles = hasBasePressedStyles || hasVariantsPressedStyles;
      const hasFocusStyles = hasBaseFocusStyles || hasVariantsFocusStyles;

      // Component template
      const componentTemplate = template(
        `
          ${reactNameSpace}.forwardRef((props, ref) => {

            COMPONENT_PROPS
            
            BREAKPOINT_HOOK

            THEME_HOOK

            HOVER_HOOK

            PRESSED_HOOK

            FOCUS_HOOK
            
            
           const styleSheet = ${packageNameSpace}.useStyleSheet("KEY", ({theme, currentBreakpoint, getClosestResponsiveValue}) => STYLE_OBJECT, USE_STYLE_SHEET_DEPS);
           
          
            const style = ${reactNameSpace}.useMemo(() => {
              const newStyle = STYLES.filter(Boolean);

              return newStyle;
            }, STYLE_MEMO_DEPS);

            return <COMP ${
              hasHoverStyles
                ? 'onHoverIn={onHoverIn} onHoverOut={onHoverOut}'
                : 'onHoverIn={onHoverInProp} onHoverOut={onHoverOutProp}'
            }

            ${
              hasPressedStyles
                ? 'onPressIn={onPressIn} onPressOut={onPressOut}'
                : 'onPressIn={onPressInProp} onPressOut={onPressOutProp}'
            }

            ${
              hasFocusStyles
                ? 'onFocus={onFocus} onBlur={onBlur}'
                : 'onFocus={onFocusProp} onBlur={onBlurProp}'
            }

            ref={ref} style={style} {...rest} />;
          })
        `,
        {
          plugins: ['jsx', 'typescript'],
        }
      );

      const KEY = getComponentId(state);
      const variantStyles = variantsIdentifier
        .map(
          (v) => `
            styleSheet[\`${v}_\${${v}}\`]
        `
        )
        .join(',');

      const variantHoverStyles = variantsIdentifier
        .map(
          (v) =>
            `isHovered ? styleSheet[\`${v}_\${${v}}${hoverPropName}\`] : undefined`
        )
        .join(',');

      const variantPressedStyles = variantsIdentifier
        .map(
          (v) =>
            `isPressed ? styleSheet[\`${v}_\${${v}}${pressPropName}\`] : undefined`
        )
        .join(',');

      const variantFocusStyles = variantsIdentifier
        .map(
          (v) =>
            `isFocused ? styleSheet[\`${v}_\${${v}}${focusPropName}\`] : undefined`
        )
        .join(',');

      const variantStyleMemoDeps = variantsIdentifier.join(', ');

      let variantProps = '';
      if (hasVariants) {
        if (defaultVariants && t.isObjectExpression(defaultVariants.value)) {
          variantProps =
            variantsIdentifier
              .map((v) => {
                let property = defaultVariants.value.properties.find(
                  (p) => p.key.name === v
                );
                if (property) {
                  let value = property.value.value;
                  value = typeof value === 'string' ? `"${value}"` : value;
                  return `${v}=${value}`;
                } else {
                  return v;
                }
              })
              .join(', ') + ',';
        } else {
          variantProps = variantsIdentifier.join(', ') + ',';
        }
      }

      const substitutions = {
        KEY,
        HOVER_HOOK: '',
        BREAKPOINT_HOOK: '',
        USE_STYLE_SHEET_DEPS: '',
        PRESSED_HOOK: '',
        FOCUS_HOOK: '',
        STYLES: '',
        THEME_HOOK: '',
        STYLE_MEMO_DEPS: '',
        COMP: t.jSXIdentifier(componentIdentifier.name),
        COMPONENT_PROPS: `const {style: propStyle, onPressIn: onPressInProp, onPressOut: onPressOutProp, onHoverIn: onHoverInProp , onHoverOut: onHoverOutProp, onFocus: onFocusProp, onBlur: onBlurProp, ${variantProps} ...rest} = props;`,

        STYLE_OBJECT: styleObjectExpression,
      };

      // Style Priority is concated in below order
      // baseStyle < variantStyle < baseFocusStyle < variantFocusStyle < baseHoverStyle < variantHoverStyle < basePressedStyle < variantPressedStyle

      substitutions.USE_STYLE_SHEET_DEPS = '[';
      substitutions.STYLES = '[styleSheet.baseStyle';
      substitutions.STYLE_MEMO_DEPS = '[styleSheet';

      if (hasThemeStyles) {
        substitutions.THEME_HOOK = packageNameSpace + '.useTheme()';
        substitutions.USE_STYLE_SHEET_DEPS =
          substitutions.USE_STYLE_SHEET_DEPS + '"theme"';
      }

      if (hasResponsiveStyles) {
        substitutions.BREAKPOINT_HOOK =
          packageNameSpace + '.useCurrentBreakpoint()';
        substitutions.USE_STYLE_SHEET_DEPS =
          substitutions.USE_STYLE_SHEET_DEPS + ', "currentBreakpoint"';
      }

      if (hasHoverStyles) {
        substitutions.HOVER_HOOK = `const {onHoverIn, onHoverOut, isHovered} = ${packageNameSpace}.useHover({onHoverIn: onHoverInProp, onHoverOut: onHoverOutProp})`;
        substitutions.STYLE_MEMO_DEPS =
          substitutions.STYLE_MEMO_DEPS + `, isHovered`;
      }

      if (hasPressedStyles) {
        substitutions.PRESSED_HOOK = `const {onPressIn, onPressOut, isPressed} = ${packageNameSpace}.usePress({onPressIn: onPressInProp, onPressOut: onPressOutProp})`;
        substitutions.STYLE_MEMO_DEPS =
          substitutions.STYLE_MEMO_DEPS + `, isPressed`;
      }

      if (hasFocusStyles) {
        substitutions.FOCUS_HOOK = `const {onFocus, onBlur, isFocused} = ${packageNameSpace}.useFocus({onFocus: onFocusProp, onBlur: onBlurProp})`;
        substitutions.STYLE_MEMO_DEPS =
          substitutions.STYLE_MEMO_DEPS + `, isFocused`;
      }

      if (hasVariants) {
        substitutions.STYLES = substitutions.STYLES + `, ${variantStyles}`;
        substitutions.STYLE_MEMO_DEPS =
          substitutions.STYLE_MEMO_DEPS + `, ${variantStyleMemoDeps}`;
      }

      if (hasBaseFocusStyles) {
        substitutions.STYLES =
          substitutions.STYLES +
          `, isFocused ? styleSheet.baseStyle${focusPropName} : undefined`;
      }

      if (hasVariantsFocusStyles) {
        substitutions.STYLES = substitutions.STYLES + `, ${variantFocusStyles}`;
      }

      if (hasBaseHoverStyles) {
        substitutions.STYLES =
          substitutions.STYLES +
          `, isHovered ? styleSheet.baseStyle${hoverPropName} : undefined`;
      }

      if (hasVariantsHoverStyles) {
        substitutions.STYLES = substitutions.STYLES + `, ${variantHoverStyles}`;
      }

      if (hasBasePressedStyles) {
        substitutions.STYLES =
          substitutions.STYLES +
          `, isPressed ? styleSheet.baseStyle${pressPropName} : undefined`;
      }

      if (hasVariantsPressedStyles) {
        substitutions.STYLES =
          substitutions.STYLES + `, ${variantPressedStyles}`;
      }

      substitutions.USE_STYLE_SHEET_DEPS =
        substitutions.USE_STYLE_SHEET_DEPS + ']';

      substitutions.STYLES = substitutions.STYLES + ', propStyle]';

      substitutions.STYLE_MEMO_DEPS =
        substitutions.STYLE_MEMO_DEPS + ', propStyle]';

      const ast = componentTemplate(substitutions);

      path.replaceWith(ast);
    }
  },
};

module.exports = visitor;
