'use strict';
var Fs = require('fire-fs');
var Path = require('fire-path');
let url = Editor.url(window.packageRoot + "panel/TestEnvAli.html", 'utf8');


module.exports = {
    init() {
        Vue.component('TestEnvAli', {
            props: ['data'],
            template: Fs.readFileSync(url),
        });
    },
};
