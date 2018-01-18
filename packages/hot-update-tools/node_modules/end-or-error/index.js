/**!
 * end-or-error - index.js
 *
 * Copyright(c) stream-utils and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <m@fengmk2.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

module.exports = function eoe(stream, cb) {
  if (!stream.readable) {
    return cb();
  }

  stream.on('error', onerror);
  stream.on('end', onend);

  function onerror(err) {
    cleanup();
    cb(err);
  }

  function onend(data) {
    cleanup();
    cb(null, data);
  }

  function cleanup() {
    stream.removeListener('error', onerror);
    stream.removeListener('end', onend);
  }
};
