co-gather
=========

Execute thunks in parallel with concurrency support and gather all the results.

`co-gather` is similar with [co-parallel](https://github.com/visionmedia/co-parallel), but `co-gather` will gather all the result of these thunks, even those thunks throw error.

## Installation

```
$ npm install co-gather
```

## Example

```js
var gather = require('co-gather');
var thread = require('co-thread');
var wait = require('co-wait');
var co = require('co');

var index = 0;
function *random() {
  var i = index++;
  yield wait(Math.random() * 100);
  if (Math.random() > 0.5) {
    throw new Error('error');
  }
  return i;
}

co(function *() {
  var ret = yield gather(thread(random, 10));
  console.log(ret);
})();
```

=>

```
[
  { isError: true, error: [Error: error] },
  { isError: true, error: [Error: error] },
  { isError: true, error: [Error: error] },
  { isError: true, error: [Error: error] },
  { isError: true, error: [Error: error] },
  { isError: false, value: 5 },
  { isError: false, value: 6 },
  { isError: false, value: 7 },
  { isError: true, error: [Error: error] },
  { isError: true, error: [Error: error] }
]
```

## API


## gather(thunks, [concurrency])

Execute `thunks` in parallel, with the given concurrency defaulting to 5, and gather the result

## License

MIT
