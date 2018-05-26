"use strict";
let packageName = "foobar";
let fs = require("fire-fs");
let path = require('fire-path');


Vue.component('foobar-inspector', {
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/inspector.css'), 'utf8') + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/inspector.html'), 'utf8') + "",

    props: {
        target: {
            twoWay: true,
            type: Object,
        }
    },
    methods: {
        onBtnClickTest() {
            Editor.log('test');
        }
    }
});