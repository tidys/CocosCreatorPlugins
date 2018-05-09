'use strict';

var path = require('path');
var BinWrapper = require('bin-wrapper');
var pkg = require('../package.json');
var url = 'https://raw.github.com/imagemin/jpeg-recompress-bin/v' + pkg.version + '/vendor/';

module.exports = new BinWrapper()
	.src(url + 'osx/jpeg-recompress', 'darwin')
	.src(url + 'linux/jpeg-recompress', 'linux')
	.src(url + 'win/jpeg-recompress.exe', 'win32')
	.dest(path.join(__dirname, '../vendor'))
	.use(process.platform === 'win32' ? 'jpeg-recompress.exe' : 'jpeg-recompress');
