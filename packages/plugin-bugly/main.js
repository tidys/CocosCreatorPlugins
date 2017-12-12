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
            Editor.Panel.open('plugin-bugly');
        },
        'say-hello'() {
            Editor.log('Hello World!');
            // send ipc message to panel
            Editor.Ipc.sendToPanel('plugin-bugly', 'plugin-bugly:hello');
        },
        'clicked'() {
            Editor.log('Button clicked!');
        },
        'popup-create-menu'(event, x, y, data) {
            let electron = require('electron');
            let BrowserWindow = electron.BrowserWindow;
            let template = [
                {
                    label: '清空日志', click() {
                    Editor.Ipc.sendToPanel('plugin-bugly', 'plugin-bugly:cleanLog', data);
                }
                },
                // {type: 'separator'},
            ];
            let editorMenu = new Editor.Menu(template, event.sender);

            x = Math.floor(x);
            y = Math.floor(y);
            editorMenu.nativeMenu.popup(BrowserWindow.fromWebContents(event.sender), x, y);
            editorMenu.dispose();
        },
        'builder:query-build-options'(event){
            Editor.Ipc.sendToPanel('plugin-bugly', 'plugin-bugly:queryBuildOptions', event);
        },
    },
};