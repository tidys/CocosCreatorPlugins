const Fs = require('fs');
const Path = require('path');
Editor.Panel.extend({
    style: Fs.readFileSync(Editor.url('packages://amazing-ui/panel/index.css'), 'utf-8'),
    template: Fs.readFileSync(Editor.url('packages://amazing-ui/panel/index.html'), 'utf-8'),

    $: {},

    ready () {
        let plugin = new Vue({
            el: this.shadowRoot,
            created () {
                this._initPlugin();
            },
            data: {},
            methods: {
                _initPlugin () {

                },
                onBtnClickRete () {
                    debugger;
                    let rete = Editor.require('packages://amazing-ui/node_modules/rete');

                }
            }

        });
    },

    messages: {}
});