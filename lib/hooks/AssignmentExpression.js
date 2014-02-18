"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function AssignmentExpression(node) {
  // can't use node.right.startToken since it might be surrounded by
  // a parenthesis (see #5)
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _tk.removeEmptyInBetween(node.left.endToken, _tk.findNextNonEmpty(operator));
  _ws.limit(operator, 'AssignmentOperator');
};
