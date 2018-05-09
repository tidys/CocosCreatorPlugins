let fs = require('fire-fs');
let packageName = "res-compress";

module.exports = {
    init() {
        console.log("image-item 注册组件!");
        Vue.component('image-item', {
            props: ['data', 'index'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/image-item.html', 'utf8')) + "",
            created() {

            },
            methods: {
                onBtnClickCompress() {
                    // this.data.isUse=!this.data.isUse;
                    // console.log("on use: " + this.data.isUse);
                    // console.log("压缩");
                    // console.log(this.data);
                    window.plugin.onImageItemCompress(this.data);
                }
            },
            computed: {},
        });
    }
};