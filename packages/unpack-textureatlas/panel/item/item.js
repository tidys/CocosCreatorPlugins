let fs = require('fire-fs');
let packageName = "unpack-textureatlas";

module.exports = {
    init() {
        console.log("item 注册组件!");
        Vue.component('item', {
            props: ['data', 'index'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/item.html', 'utf8')) + "",
            created() {

            },
            methods: {
                onBtnClickSplit() {
                    window.plugin.onSplitItemPlist(this.data);
                },
                onBtnClickDel() {
                    // 删除这个plist配置
                    let selectionMeta = Editor.remote.assetdb.loadMetaByUuid(this.data.uuid);
                    const pngUuid = Editor.remote.assetdb.uuidToUrl(selectionMeta.rawTextureUuid);
                    Editor.assetdb.delete([this.data.url, pngUuid], function (err, results) {
                        results.forEach(function (result) {
                            console.log("del: " + result.path);
                        });
                        window.plugin.onBtnClickRefreshProject();
                    })
                }
            },
            computed: {},
        });
    }
};