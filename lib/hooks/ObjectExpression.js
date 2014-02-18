"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function ObjectExpression(node) {
  if (!node.properties.length) return;

  // TODO: improve this, there are probably more edge cases
  var shouldBeSingleLine = node.parent.type === 'ForInStatement';

  if (!shouldBeSingleLine) {
    _br.limit(node.startToken, 'ObjectExpressionOpeningBrace');
  } else {
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }

  node.properties.forEach(function(prop) {
    if (!shouldBeSingleLine) {
      _br.limitBefore(prop.startToken, 'Property');
    }
    var token = prop.endToken.next;
    while (token && token.value !== ',' && token.value !== '}') {
      // TODO: toggle behavior if comma-first
      if (token.type === 'LineBreak') {
        _tk.remove(token);
      }
      token = token.next;
    }

    if (shouldBeSingleLine && prop.key.startToken.prev.value !== '{') {
      _ws.limitBefore(prop.key.startToken, 'Property');
    }
    _ws.limitAfter(prop.key.endToken, 'PropertyName');
    _ws.limitBefore(prop.value.startToken, 'PropertyValue');
    if (!shouldBeSingleLine) {
      _br.limitAfter(prop.endToken, 'Property');
    }
  });

  if (!shouldBeSingleLine) {
    _tk.removeEmptyAdjacentBefore(node.endToken);
    _br.limit(node.endToken, 'ObjectExpressionClosingBrace');
  }
};
