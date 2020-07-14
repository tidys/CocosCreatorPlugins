'use strict';

module.exports = {
    load () {
    },

    unload () {
    },

    messages: {
        'open' () {
            Editor.Panel.open('res-compress');
        },
        // 文件移动
        'asset-db:assets-moved': function (event, target) {
            // Editor.log('[Mp3Compress] 文件移动,刷新列表!');
            Editor.Ipc.sendToPanel('res-compress', 'res-compress:hello', target);
        },
        // 文件删除
        'asset-db:assets-deleted': function (event, target) {
            // Editor.log('[Mp3Compress] 文件删除,刷新列表!');
            Editor.Ipc.sendToPanel('res-compress', 'res-compress:hello', target);
        },
        // 文件创建
        'asset-db:assets-created': function (event, target) {
            // Editor.log('[Mp3Compress] 文件创建,刷新列表!');
            Editor.Ipc.sendToPanel('res-compress', 'res-compress:hello', target);
        },
    },
};
