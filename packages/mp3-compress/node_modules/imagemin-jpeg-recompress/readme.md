# imagemin-jpeg-recompress [![Build Status](https://travis-ci.org/imagemin/imagemin-jpeg-recompress.svg?branch=master)](https://travis-ci.org/imagemin/imagemin-jpeg-recompress) [![Build status](https://ci.appveyor.com/api/projects/status/gl9i2tudi4oggk0v?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/imagemin-jpeg-recompress)

> jpeg-recompress imagemin plugin


## Install

```
$ npm install --save imagemin-jpeg-recompress
```


## Usage

```js
const imagemin = require('imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

imagemin(['images/*.jpg'], 'build/images', {
	plugins: [
		imageminJpegRecompress()
	]
}).then(() => {
	console.log('Images optimized');
});
```


## API

### imageminJpegRecompress([options])(buffer)

#### options

##### accurate

Type: `boolean`<br>
Default: `false`

Favor accuracy over speed.

##### quality

Type: `string`<br>
Default: `medium`

Set a quality preset. Available presets: `low`, `medium`, `high` and `veryhigh`.

##### method

Type: `string`<br>
Default: `ssim`

Set [comparison method](https://github.com/danielgtaylor/jpeg-archive#image-comparison-metrics). Available methods: `mpe`, `ssim`, `ms-ssim` and `smallfry`.

##### target

Type: `number`<br>
Default: `0.9999`

Set target quality.

##### min

Type: `number`<br>
Default: `40`

Minimum JPEG quality.

##### max

Type: `number`<br>
Default: `95`

Maximum JPEG quality.

##### loops

Type: `number`<br>
Default: `6`

Set the number of attempts.

##### defish

Type: `number`<br>
Default: `0`

Set defish strength.

##### progressive

Type: `boolean`<br>
Default: `true`

Enable progressive encoding.

##### subsample

Type: `string`<br>
Default: `default`

Set subsampling method. Available values: `default`, `disable`.

##### strip

Type: `boolean`<br>
Default: `true`

Strips metadata, such as EXIF data.

#### buffer

Type: `buffer`

Buffer to optimize.


## License

MIT © [imagemin](https://github.com/imagemin)
