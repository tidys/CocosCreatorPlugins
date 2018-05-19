let fs = require('fire-fs');
let packageName = "resize-image";

module.exports = {
    init() {
        console.log("image-item 注册组件!");
        Vue.component('image-item', {
            props: ['data', 'index'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/item.html', 'utf8')) + "",
            created() {
                this.$nextTick(function () {
                    this.onMouseOut();
                })
            },
            methods: {
                onClickBtnDel(event) {
                    window.plugin.delImage(this.data);
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
            },
            computed: {},
        });
    }
};