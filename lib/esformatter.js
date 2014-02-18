'use strict';


// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.



var rocambole = require('rocambole');
var indent = require('./indent/indent');
var _options = require('./options');


// ---


var _ast = require('rocambole-node');
var _ws = require('./whiteSpace/whiteSpace');
var _br = require('./lineBreak/lineBreak');
var _tk = require('rocambole-token');
var addSpaceInsideExpressionParentheses = require('./hooks/addSpaceInsideExpressionParentheses');


// ---


exports.hooks = require('./hooks');
exports.format = format;
exports.transform = transform;


// ---


function format(str, opts) {
  _options.set(opts);

  var ast = rocambole.parse(str);
  transform(ast, opts);

  return ast.toString();
}


function transform(ast, opts) {
  _options.set(opts);

  _tk.eachInBetween(ast.startToken, ast.endToken, preprocessToken);
  rocambole.moonwalk(ast, transformNode);
  _tk.eachInBetween(ast.startToken, ast.endToken, postprocessToken);

  // indent should come after all other transformations since it depends on
  // line breaks caused by "parent" nodes, otherwise it will cause conflicts.
  // it should also happen after the postprocessToken since it adds line breaks
  // before/after comments and that changes the indent logic
  indent.transform(ast);

  if (process.env.LOG_TOKENS) {
    _ast.logTokens(ast);
  }

  return ast;
}


function transformNode(node) {
  _br.aroundNodeIfNeeded(node);

  if (node.type in exports.hooks) {
    exports.hooks[node.type](node);
  }

  // handle parenthesis automatically since it is needed by multiple node types
  // and it avoids code duplication and reduces complexity of each hook
  addSpaceInsideExpressionParentheses(node);

  // automatic white space comes afterwards since line breaks introduced by the
  // hooks affects it
  _ws.limitBefore(node.startToken, node.type);
  _ws.limitAfter(node.endToken, node.type);
}


function preprocessToken(token) {
  if (_tk.isComment(token)) {
    _br.limit(token, token.type);
  }
}


function postprocessToken(token) {
  // FIXME: need to remove trailing white space
  if (_tk.isComment(token)) {
    processComment(token);
  }
}


function processComment(token) {
  _ws.limitBefore(token, token.type);
  // only block comment needs space afterwards
  if (token.type === 'BlockComment') {
    _ws.limitAfter(token, token.type);
  }
}
