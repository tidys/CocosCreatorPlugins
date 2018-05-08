'use strict';

const Fs = require('fire-fs');

var getParent = function (scene, item) {
    var parentID = null;
    try {
        switch (item['__type__']) {
            case 'cc.Node':
                parentID = item['_parent']['__id__'];
                break;
            case 'cc.PrefabInfo':
                parentID = item['root']['__id__'];
                break;
            case 'cc.Scene':
                break;
            default:
                parentID = item['node']['__id__'];
        }
    } catch (error) {
        Editor.warn(error);
        Editor.warn(item);
    }

    return scene[parentID];
};

exports.conversion = function (scene, item) {
    var path = [item['_name']];
    var _id = '';
    while (item = getParent(scene, item)) {
        if (item['__type__'] === 'cc.Node') {
            if (!_id) {
                _id = item['_id'];
            }
            path.splice(0, 0, item['_name']);
        }
    }
    path = path.filter(function (str) {
        return !!str;
    });
    return {
        path: path.join('/'),
        uuid: _id
    };
};

exports.search = function (fire, uuid) {
    var paths = [];

    var jsonPath = fire.destPath;
    var json = Fs.readJsonSync(jsonPath);

    json.some(function (item) {
        var type = item.__type__;
        var __uuid__ = Editor.Utils.UuidUtils.decompressUuid(type);

        if (__uuid__ === uuid) {
            let path = exports.conversion(json, item);
            paths.push(path);
            return true;
        }

        var keys = Object.keys(item);
        keys.some(function (name) {
            var prop = item[name];
            if (prop && prop.__uuid__ === uuid) {
                let path = exports.conversion(json, item);
                paths.push(path);
                return true;
            }

        });
    });

    return paths;
};