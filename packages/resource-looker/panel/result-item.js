const fs = require('fire-fs');
let packageName = "resource-looker";

module.exports = function () {
    console.log("result-item 注册组件!");
    Vue.component('result-item', {
        props: ['data', 'index'],
        template: fs.readFileSync(Editor.url(`packages://${packageName}/panel/result-item.html`), 'utf8'),
        created() {
            this.$nextTick(function () {
                this.onMouseOut();
            })
        },
        methods: {
            onMenu(event) {
                // Editor.Ipc.sendToMain('bitmap-font:popup-create-menu', event.x, event.y, this.data);
                console.log("on right mouse menu: " + this.data.image);
            },
            onMouseOver() {
                this.$el.style.backgroundColor = '#777';
            },
            onMouseOut() {
                let bgColor = '#333';
                if (this.index % 2) {
                    bgColor = '#333';
                } else {
                    bgColor = '#444';
                }
                this.$el.style.backgroundColor = bgColor;
            },
            onBtnClickSelectItem(){
                console.log("click item");
            }


        },
        computed: {},
    });
}
