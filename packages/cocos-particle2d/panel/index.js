var FS = require("fire-fs");

Editor.Panel.extend({
    style: FS.readFileSync(Editor.url('packages://cocos-particle2d/panel/index.css', 'utf8')) + "",
    template: FS.readFileSync(Editor.url('packages://cocos-particle2d/panel/index.html', 'utf8')) + "",

    $: {},

    ready() {

    },

    messages: {
        'cocos-particle2d:hello'(event) {
        }
    }
});