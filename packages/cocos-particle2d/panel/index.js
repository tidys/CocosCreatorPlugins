var FS = require("fire-fs");

Editor.Panel.extend({
    style: FS.readFileSync(Editor.url('packages://cocos-particle2d/panel/index.css', 'utf8')) + "",
    template: FS.readFileSync(Editor.url('packages://cocos-particle2d/panel/index.html', 'utf8')) + "",

    $: {},

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {

            },
            init() {

            },
            data: {
                test: ""
            },
            methods: {
                onBtnClickTest() {
                    console.log("1111");
                    // let myScript = document.createElement("script");
                    // myScript.type = "text/javascript";
                    // myScript.appendChild(document.createTextNode("function functionOne(){alert(\"成功运行\"); }"));
                    // document.body.appendChild(myScript);
                    // functionOne();
                },
                onUpdateSaveName() {

                },
                onClickGen() {

                },
                onSelectImportPath() {

                }

            }
        });
    },

    messages: {
        'cocos-particle2d:hello'(event) {
        }
    }
});
