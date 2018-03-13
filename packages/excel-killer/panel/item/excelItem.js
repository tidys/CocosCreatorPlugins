let fs = require('fire-fs');
let packageName = "excel-killer";

module.exports = {
    init() {
        console.log("excel-item 注册组件!");
        Vue.component('excel-item', {
            props: ['data', 'index'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/excelItem.html', 'utf8')) + "",
            created() {

            },
            methods: {
                onBtnClickUse() {
                    this.data.isUse=!this.data.isUse;
                    console.log("on use: " + this.data.isUse);

                }
            },
            computed: {},
        });
    }
};