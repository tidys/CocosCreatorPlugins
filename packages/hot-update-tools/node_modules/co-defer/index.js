var co = require('co')

exports = module.exports = deferImmediate
exports.defer =
exports.immediate =
exports.setImmediate = deferImmediate

function createCallback(ctx, gen, cb) {
  return function () {
    cb = cb || error
    co.call(ctx, gen).then(function () {
      cb()
    }, cb)
  }
}

function deferImmediate(gen, cb) {
  return setImmediate(createCallback(this, gen, cb))
}

exports.nextTick = function deferNextTick(gen, cb) {
  return process.nextTick(createCallback(this, gen, cb))
}

exports.timeout =
exports.setTimeout = function deferTimeout(gen, timeout, cb) {
  return setTimeout(createCallback(this, gen, cb), timeout)
}

exports.interval =
exports.setInterval = function deferInterval(gen, timeout, cb) {
  return setInterval(createCallback(this, gen, cb), timeout)
}

function error(err) {
  if (err) throw err
}
