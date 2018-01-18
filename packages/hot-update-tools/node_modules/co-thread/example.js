
/**
 * Module dependencies.
 */

var get = require('co-request');
var thread = require('./');
var co = require('co');

co(function *(){

  var times = 10;

  while (times--) {
    yield thread(function *(){
      var res = yield get('http://google.com');
      console.log(res.statusCode);
    }, 20);
  }

})();