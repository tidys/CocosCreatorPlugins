'use strict';
const execBuffer = require('exec-buffer');
const isJpg = require('is-jpg');
const jpegRecompress = require('jpeg-recompress-bin');

module.exports = opts => buf => {
	opts = Object.assign({}, opts);

	if (!Buffer.isBuffer(buf)) {
		return Promise.reject(new TypeError('Expected a buffer'));
	}

	if (!isJpg(buf)) {
		return Promise.resolve(buf);
	}

	const args = ['--quiet'];

	if (opts.accurate) {
		args.push('--accurate');
	}

	if (opts.quality) {
		args.push('--quality', opts.quality);
	}

	if (opts.method) {
		args.push('--method', opts.method);
	}

	if (opts.target) {
		args.push('--target', opts.target);
	}

	if (opts.min) {
		args.push('--min', opts.min);
	}

	if (opts.max) {
		args.push('--max', opts.max);
	}

	if (opts.loops) {
		args.push('--loops', opts.loops);
	}

	if (opts.defish) {
		args.push('--defish', opts.defish);
	}

	if (opts.zoom) {
		args.push('--zoom', opts.zoom);
	}

	if (opts.progressive === false) {
		args.push('--no-progressive');
	}

	if (opts.subsample) {
		args.push('--subsample', opts.subsample);
	}

	if (opts.strip !== false) {
		args.push('--strip');
	}

	args.push(execBuffer.input, execBuffer.output);

	return execBuffer({
		input: buf,
		bin: jpegRecompress,
		args
	}).catch(err => {
		err.message = err.stderr || err.message;
		throw err;
	});
};
