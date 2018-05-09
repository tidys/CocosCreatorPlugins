'use strict';

var log = require('logalot');
var bin = require('./');

bin.run(['--version'], function (err) {
	if (err) {
		log.error(err.stack);
		return;
	}

	log.success('jpeg-recompress pre-build test passed successfully');
});
