'use strict';

module.exports = {
    load() {
    },

    unload() {
    },

    messages: {
        'open'() {
            // open entry panel registered in package.json
            Editor.Panel.open('plugin-4399-web-js-sdk');
        },
        'say-hello'() {
            Editor.log('Hello World!');
            // send ipc message to panel
        },
        'clicked'() {
            Editor.log('Button clicked!');
        },
        'editor:build-finished': function (event, target) {
            Editor.Ipc.sendToPanel('plugin-4399-web-js-sdk', 'plugin-4399-web-js-sdk:onBuildFinished');
        }
    },
};