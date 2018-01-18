end-or-error
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/end-or-error.svg?style=flat-square
[npm-url]: https://npmjs.org/package/end-or-error
[travis-image]: https://img.shields.io/travis/stream-utils/end-or-error.svg?style=flat-square
[travis-url]: https://travis-ci.org/stream-utils/end-or-error
[coveralls-image]: https://img.shields.io/coveralls/stream-utils/end-or-error.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/stream-utils/end-or-error?branch=master
[gittip-image]: https://img.shields.io/gittip/fengmk2.svg?style=flat-square
[gittip-url]: https://www.gittip.com/fengmk2/
[david-image]: https://img.shields.io/david/stream-utils/end-or-error.svg?style=flat-square
[david-url]: https://david-dm.org/stream-utils/end-or-error
[download-image]: https://img.shields.io/npm/dm/end-or-error.svg?style=flat-square
[download-url]: https://npmjs.org/package/end-or-error

Listen readable stream `end` or `error` event once.

## Install

```bash
$ npm i end-or-error
```

## Usage

```js
var eoe = require('end-or-error');

var stream = createReadStreamSomeHow();

eoe(stream, function (err) {
  // err => stream emitted "error" event
});
```

## License

[MIT](LICENSE)
