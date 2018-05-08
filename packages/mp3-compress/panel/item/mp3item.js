let fs = require('fire-fs');
let packageName = "mp3-compress";

module.exports = {
    init() {
        console.log("mp3-item 注册组件!");
        Vue.component('mp3-item', {
            props: ['data', 'index'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/mp3item.html', 'utf8')) + "",
            created() {

            },
            methods: {
                onBtnClickCompress() {
                    // this.data.isUse=!this.data.isUse;
                    // console.log("on use: " + this.data.isUse);
                    // console.log("压缩");
                    // console.log(this.data);
                    window.plugin.onItemCompress(this.data);
                }
            },
            computed: {},
        });
    }
};