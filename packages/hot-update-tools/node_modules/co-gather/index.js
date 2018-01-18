/*!
 * co-gather - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var thread = require('co-thread');

module.exports = function *gather(thunks, n){
  n = Math.min(n || 5, thunks.length);
  var ret = [];
  var index = 0;

  function *next() {
    var i = index++;
    ret[i] = {isError: false};
    try {
      ret[i].value = yield thunks[i];
    } catch (err) {
      ret[i].error = err;
      ret[i].isError = true;
    }

    if (index < thunks.length) yield next;
  }

  yield thread(next, n);

  return ret;
};
