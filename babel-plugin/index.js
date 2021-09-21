const visitor = require('./visitor');
const utilityPropVisitorv3 = require('./utility-prop-v3');

function transformer() {
  return {
    visitor: {
      ...visitor,
      'Program'(path) {
        visitor.Program(path);
        utilityPropVisitorv3.Program(path);
      },
      'FunctionDeclaration|ArrowFunctionExpression'(path, state) {
        utilityPropVisitorv3['FunctionDeclaration|ArrowFunctionExpression'](
          path,
          state
        );
      },
    },
  };
}

module.exports = transformer;
