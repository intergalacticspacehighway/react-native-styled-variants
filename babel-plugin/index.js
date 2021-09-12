const visitor = require('./visitor');

function transformer() {
  return {
    visitor,
  };
}

module.exports = transformer;
