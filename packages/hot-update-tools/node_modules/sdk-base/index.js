/**
 * Copyright(c) dead_horse and other contributors.
 * MIT Licensed
 *
 * Authors:
 * 	 dead_horse <dead_horse@qq.com>
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var ready = require('get-ready');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = Base;

function Base() {
  EventEmitter.call(this);
  this.on('error', this.defaultErrorHandler.bind(this));
}

/**
 * inherits from EventEmitter
 */

util.inherits(Base, EventEmitter);

ready.mixin(Base.prototype);

Base.prototype.defaultErrorHandler = function (err) {
  if (this.listeners('error').length > 1) {
    // ignore defaultErrorHandler
    return;
  }
  console.error('\n[%s][pid: %s][%s][%s] %s: %s \nError Stack:\n  %s',
    Date(), process.pid, this.constructor.name, __filename, err.name,
    err.message, err.stack);

  // try to show addition property on the error object
  // e.g.: `err.data = {url: '/foo'};`
  var additions = [];
  for (var key in err) {
    if (key === 'name' || key === 'message') {
      continue;
    }

    additions.push(util.format('  %s: %j', key, err[key]));
  }
  if (additions.length) {
    console.error('Error Additions:\n%s', additions.join('\n'));
  }
  console.error();
};
