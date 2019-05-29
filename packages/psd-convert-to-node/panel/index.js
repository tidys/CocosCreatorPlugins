const Path = require("fire-path");
const Fs = require("fire-fs");

Editor.Panel.extend({
    style: Fs.readFileSync(Editor.url('packages://psd-convert-to-node/panel/index.css'), 'utf-8'),
    template: Fs.readFileSync(Editor.url('packages://psd-convert-to-node/panel/index.html'), 'utf-8'),
    $: {},
    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
            },
            data: {
                psdFile: null,
                pngDir: null,
                saveName: null,
            },
            methods: {
                onBtnClickSelectPSDFile() {
                    let res = Editor.Dialog.openFile({
                        title: "选择PSD文件",
                        properties: ['openFile'],
                        defaultPath: Editor.projectInfo.path,
                        filters: [
                            {
                                name: `PSD File`,
                                extensions: ["psd", 'layout.txt']
                            }
                        ],

                    });
                    if (res !== -1) {
                        this.psdFile = res[0];
                    }
                },
                onBtnClickSelectPngDir() {
                    let res = Editor.Dialog.openFile({
                        title: "选择导入manifest的目录",
                        defaultPath: Path.join(Editor.projectInfo.path, 'assets'),
                        properties: ['openDirectory'],

                    });
                    if (res !== -1) {
                        this.pngDir = res[0];
                        this.saveName = Path.basenameNoExt(this.pngDir);
                    }

                },
                onBtnClickConvert() {
                    let layoutPath = this.psdFile;
                    let pngFolder = this.pngDir;
                    if (!layoutPath) {
                        Editor.error("请输入布局文件的全部路径");
                        return;
                    }
                    if (!pngFolder) {

                        Editor.error("请输入PNG文件夹的全部路径");
                        return;
                    }
                    let isReverse = false;
                    let isSaveJson = false;

                    Editor.Ipc.sendToMain("psd-convert-to-node:convert-psd-file",
                        [isReverse, isSaveJson, layoutPath, pngFolder],
                        msg => {

                            Editor.log("从psd转换为节点树，msg:", msg, ",nodeName:", "Canvas");
                        }, 1000 * 1000);
                },

            }
        });


    },
    messages: {
        "get-mount-node-name"(ev) {
            if (ev.reply) {
                ev.reply("Canvas");
            }
        }
    }
});
