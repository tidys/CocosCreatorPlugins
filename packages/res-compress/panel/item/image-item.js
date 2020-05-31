const Fs = require('fire-fs');
const Msg = Editor.require('packages://res-compress/panel/msg.js');

module.exports = () => {
    Vue.component('image-item', {
        props: ['data', 'index'],
        template: Fs.readFileSync(Editor.url('packages://res-compress/panel/item/image-item.html'), 'utf-8'),
        created () {
        },
        methods: {
            onBtnClickCompress () {
                // this.data.isUse=!this.data.isUse;
                // console.log("on use: " + this.data.isUse);
                // console.log("压缩");
                // console.log(this.data);
                this.$root.$emit(Msg.CompressImage, this.data);
            }
        },
        computed: {},
    });
}
