'use strict';

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'open'() {
            // open entry panel registered in package.json
            Editor.Panel.open('mp3-compress');
        },
        'say-hello'() {
            Editor.log('Hello World!');
            // send ipc message to panel
            Editor.Ipc.sendToPanel('mp3-compress', 'mp3-compress:hello');
        },
        'clicked'() {
            Editor.log('Button clicked!');
        },
        // 文件移动
        'asset-db:assets-moved': function (event, target) {
            // Editor.log('[Mp3Compress] 文件移动,刷新列表!');
            Editor.Ipc.sendToPanel('mp3-compress', 'mp3-compress:hello', target);
        },
        // 文件删除
        'asset-db:assets-deleted': function (event, target) {
            // Editor.log('[Mp3Compress] 文件删除,刷新列表!');
            Editor.Ipc.sendToPanel('mp3-compress', 'mp3-compress:hello', target);
        },
        // 文件创建
        'asset-db:assets-created': function (event, target) {
            // Editor.log('[Mp3Compress] 文件创建,刷新列表!');
            Editor.Ipc.sendToPanel('mp3-compress', 'mp3-compress:hello', target);
        },

    },
};