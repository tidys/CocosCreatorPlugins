
/**
 * Expose `thread`.
 */

module.exports = thread;

/**
 * Run `fn` `n` times in parallel.
 *
 * @param {Function} fn
 * @param {Number} n
 * @return {Array}
 * @api public
 */

function thread(fn, n) {
  var gens = [];
  while (n--) gens.push(fn);
  return gens;
}