"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function IfStatement(node) {

  var startBody = node.consequent.startToken;
  var endBody = node.consequent.endToken;

  var conditionalStart = _tk.findPrev(node.test.startToken, '(');
  var conditionalEnd = _tk.findNext(node.test.endToken, ')');

  _tk.removeEmptyInBetween(node.startToken, conditionalStart);
  _tk.removeEmptyInBetween(conditionalEnd, startBody);

  _ws.limit(conditionalStart, 'IfStatementConditionalOpening');
  _ws.limit(conditionalEnd, 'IfStatementConditionalClosing');

  var alt = node.alternate;
  if (alt) {
    var elseKeyword = _tk.findPrev(alt.startToken, 'else');
    var startEmptyRemove = _tk.findPrevNonEmpty(elseKeyword);
    if (!(startEmptyRemove.type === 'Punctuator' && startEmptyRemove.value === '}')) {
      startEmptyRemove = elseKeyword;
    }
    _tk.removeEmptyInBetween(startEmptyRemove, alt.startToken);

    if (alt.type === 'IfStatement') {
      // ElseIfStatement
      _ws.before(alt.startToken);

      _br.limitBefore(alt.consequent.startToken, 'ElseIfStatementOpeningBrace');
      _br.limitBefore(alt.consequent.endToken, 'ElseIfStatementClosingBrace');
      _br.limitBefore(elseKeyword, 'ElseIfStatement');
      _br.limitAfter(alt.consequent.endToken, 'ElseIfStatement');
    } else if (alt.type === 'BlockStatement') {
      // ElseStatement
      _ws.beforeIfNeeded(elseKeyword);
      _br.limit(alt.startToken, 'ElseStatementOpeningBrace');
      _ws.limit(alt.startToken, 'ElseStatementOpeningBrace');

      if (_br.needsBefore('ElseStatementClosingBrace')) {
        var lastNonEmpty = _tk.findPrevNonEmpty(alt.endToken);
        _tk.removeInBetween(lastNonEmpty, alt.endToken, 'WhiteSpace');
        _br.limit(alt.endToken, 'ElseStatementClosingBrace');
      } else {
        _ws.limit(alt.endToken, 'ElseStatementClosingBrace');
      }
      _br.limitBefore(elseKeyword, 'ElseStatement');
      _br.limitAfter(alt.endToken, 'ElseStatement');
    } else {
      // ElseStatement without curly braces
      _ws.after(elseKeyword); // required
    }
  }

  // only handle braces if block statement
  if (node.consequent.type === 'BlockStatement') {
    _tk.removeEmptyInBetween(_tk.findPrevNonEmpty(endBody), endBody);

    _br.limit(startBody, 'IfStatementOpeningBrace');
    _ws.limit(startBody, 'IfStatementOpeningBrace');
    if (!alt) {
      _br.limit(endBody, 'IfStatementClosingBrace');
    } else {
      _br.limitBefore(endBody, 'IfStatementClosingBrace');
    }
    _ws.limit(endBody, 'IfStatementClosingBrace');
  }

};
