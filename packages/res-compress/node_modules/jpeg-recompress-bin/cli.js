#!/usr/bin/env node
'use strict';

var spawn = require('child_process').spawn;
var jpegRecompress = require('./');
var input = process.argv.slice(2);

spawn(jpegRecompress, input, {stdio: 'inherit'})
	.on('exit', process.exit);
