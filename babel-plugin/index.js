const visitor = require('./visitor');
const utilityPropVisitor = require('./utility-prop-visitor');

function transformer() {
  return {
    visitor: {
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
    },
  };
}

module.exports = transformer;
