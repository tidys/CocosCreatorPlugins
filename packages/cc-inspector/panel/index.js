const Fs = require("fire-fs");

Editor.Panel.extend({
    style: Fs.readFileSync(Editor.url('packages://cc-inspector/panel/index.css'), "utf-8"),

    template: Fs.readFileSync(Editor.url('packages://cc-inspector/panel/index.html'), "utf-8"),

    $: {},

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                debugger;
                this.$els.web;


            },
            init() {

            },
            data: {
                test: ""
            },
            methods: {
                onBtnClickTest() {
                    console.log("1111");
                    let url = Editor.url('packages://cc-inspector/panel/preview.js');
                    let preview = Editor.require(url);

                    preview.run();
                },


            }
        })
    },

    messages: {}
});