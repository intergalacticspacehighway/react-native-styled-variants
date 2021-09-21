const visitor = require('./visitor');
const utilityPropVisitor = require('./utility-prop-v2');
const utilityPropVisitorv3 = require('./utility-prop-v3');

function transformer() {
  return {
    visitor: {
      ...visitor,
      'Program'(path) {
        visitor.Program(path);
        utilityPropVisitor.Program(path);
        utilityPropVisitorv3.Program(path);
      },
      'FunctionDeclaration|ArrowFunctionExpression'(path) {
        utilityPropVisitor['FunctionDeclaration|ArrowFunctionExpression'](path);
        utilityPropVisitorv3['FunctionDeclaration|ArrowFunctionExpression'](
          path
        );
      },
    },
  };
}

module.exports = transformer;
