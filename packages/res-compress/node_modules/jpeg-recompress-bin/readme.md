# jpeg-recompress-bin [![Build Status](https://travis-ci.org/imagemin/jpeg-recompress-bin.svg?branch=master)](https://travis-ci.org/imagemin/jpeg-recompress-bin) [![Build status](https://ci.appveyor.com/api/projects/status/urrynklun4pluiwb?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/jpeg-recompress-bin)

> Compress JPEGs by re-encoding to the smallest JPEG quality while keeping perceived visual quality the same and by making sure huffman tables are optimized


## Install

```
$ npm install --save jpeg-recompress-bin
```


## Usage

```js
var execFile = require('child_process').execFile;
var jpegRecompress = require('jpeg-recompress-bin');

execFile(jpegRecompress, ['--quality high', '--min 60', 'input.jpg', 'output.jpg'], function (err) {
	console.log('Image minified');
});
```


## CLI

```
$ npm install --global jpeg-recompress-bin
```

```
$ jpeg-recompress --help
```


## License

MIT © [imagemin](https://github.com/imagemin)
