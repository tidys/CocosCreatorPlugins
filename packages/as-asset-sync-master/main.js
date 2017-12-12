'use strict';

module.exports = {
    messages: {
        'editor:build-finished': function (event, target) {
            var fs = require("fire-fs");
            var path = require("fire-path");
            var fse = require('fs-extra');
            var rimraf = require('rimraf');

            var root = path.normalize(target.dest);
            var src = path.join(root, "src");
            var res = path.join(root, "res");
            var androidSrc = path.join(root, "frameworks/runtime-src/proj.android-studio/app/assets/src");
            var androidRes = path.join(root, "frameworks/runtime-src/proj.android-studio/app/assets/res");

            if (fs.existsSync(androidSrc)) {
                rimraf.sync(androidSrc);
                Editor.log('Delete: ' + androidSrc + 'success~');
            }

            if (fs.existsSync(androidRes)) {
                rimraf.sync(androidRes);
                Editor.log('Delete: ' + androidRes + 'success~');
            }

            fse.copy(src, androidSrc, err => {
                if (err) {
                    Editor.log(err);
                } else {
                    Editor.log('copy: ' + src + ' to ' + androidSrc + 'success~');
                }
            });

            fse.copy(res, androidRes, err => {
                if (err) {
                    Editor.log(err);
                }
                else {
                    Editor.log('Copy: ' + res + ' to ' + androidRes + 'success~');
                }
            });

            Editor.log('[Sync Res] Copy res and src to proj.android-studio success~');
        }
    },
};