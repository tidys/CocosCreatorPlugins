
# co-thread

  Run a generator function in parallel N times.

## Installation

```
$ npm install co-thread
```

## Example

  Send a request in batches of `20` parallel GETs:

```js
var thread = require('co-thread');
var get = require('co-request');
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
```

## License

  MIT