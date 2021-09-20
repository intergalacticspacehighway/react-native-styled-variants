const visitor = require('./visitor');
const utilityPropVisitor = require('./utility-prop-v2');

function transformer() {
  return {
    visitor: {
      ...visitor,
      'Program'(path) {
        visitor.Program(path);
        utilityPropVisitor.Program(path);
      },
      'FunctionDeclaration|ArrowFunctionExpression'(path) {
        utilityPropVisitor['FunctionDeclaration|ArrowFunctionExpression'](path);
      },
    },
  };
}

module.exports = transformer;
