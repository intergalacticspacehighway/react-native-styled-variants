const visitor = require('./visitor');
const utilityPropVisitor = require('./utility-prop-visitor');

function transformer() {
  return {
    visitor: {
      ...visitor,
      ...utilityPropVisitor,
      Program(path) {
        visitor.Program(path);
        utilityPropVisitor.Program(path);
      },
    },
  };
}

module.exports = transformer;
