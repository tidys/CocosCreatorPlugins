// 这个脚本主要处理cocos creator v2.x的版本,构建后的资源和构建前资源的关联
const Fs = require("fire-fs");
const Path = require("fire-path");

Editor.Panel.extend({
    style: ``,

    template: `<ui-button id="btn" @confirm = 'onBtnClickTest'>Test</ui-button>`,

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                let Builder = null;
                if (Editor.isMainProcess) {
                    Builder = Editor.Builder;
                } else {
                    Builder = Editor.remote.Builder;
                }

                if (Builder) {
                    // Builder.on('before-change-files', function (options, callback) {
                    //     callback();
                    // }.bind(this));
                }

            },
            data: {},
            methods: {
                onBtnClickTest() {
                    Editor.log("onBtnClickTest");
                },
                _onBuild(options) {
                    console.log('Building ' + options.platform + ' to ' + options.dest);
                    let assetdb = Editor.isMainProcess ? Editor.assetdb : Editor.remote.assetdb;

                    let file = [
                        'channelInfo.json',
                        'serverInfo.json',
                        'versionInfo.json',
                    ];
                    let platformDir = Path.join(options.buildPath, options.actualPlatform);
                    let projectPath = Editor.projectInfo.path;
                    // 构建前后 路径转换
                    for (let i = 0; i < file.length; i++) {
                        let item = file[i];
                        let uuid = assetdb.urlToUuid(`db://assets/resources/${item}`);
                        let uuidDir = `${uuid.slice(0, 2)}/${uuid}.json`;
                        let destFilePath = Path.join(platformDir, "res/import/" + uuidDir);

                        if (Fs.existsSync(destFilePath)) {
                            let destData = JSON.parse(Fs.readFileSync(destFilePath, 'utf-8'));
                            // let sourceFilePath = assetdb.uuidToFspath(uuid);
                            let sourceFilePath = Path.join(projectPath, `serverinfo/${item}`);
                            if (Fs.existsSync(sourceFilePath)) {
                                let sourceData = JSON.parse(Fs.readFileSync(sourceFilePath, 'utf-8'));
                                destData.json = sourceData;
                                Fs.writeFileSync(destFilePath, JSON.stringify(destData));
                                Editor.log(`[ServerInfo] change: ${item} - ${Path.relative(projectPath, destFilePath)}`);
                            } else {
                                console.log("不存在文件：" + sourceFilePath);
                            }
                        } else {
                            console.log("文件不存在：" + destFilePath);
                        }
                    }
                }
            },
        })
    },

    messages: {
        'editor:build-start': function (event, target) {
            Editor.log('build-start');
        },
        'editor:build-finished': function (event, target) {
            this.plugin._onBuild(target);
        }
    }
});