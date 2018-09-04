const fs = require("fire-fs");
module.exports = function () {
    Vue.component('file-item', {
        template: fs.readFileSync(Editor.url('packages://qiniu/panel-7niu/file-item.html'),"utf-8"),
        props: ['data'],
        created() {
            this._dealFileInfo();
        },
        watch: {
            'data'(value) {
                console.log(value);
            }
        },
        data() {
            return {
                size: 0,
            };
        },
        methods: {
            _dealFileInfo() {

            },
            getFileSize() {
                if (this.data) {
                    let b = this.data.fsize / 1024;
                    if (b < 1) {
                        return (b * 1024).toFixed(2) + "b"
                    }
                    let m = b / 1024;
                    if (m < 1) {
                        return (m * 1024).toFixed(2) + "kb";
                    }
                    return m.toFixed(2) + "M";
                }
            }
        }
    });
};