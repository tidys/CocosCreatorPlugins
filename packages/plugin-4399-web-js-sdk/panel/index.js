var FS = require("fire-fs");
var PATH = require('fire-path');
var CfgUtil = Editor.require("packages://plugin-4399-web-js-sdk/core/CfgUtil");

Editor.Panel.extend({
    style: FS.readFileSync(Editor.url('packages://plugin-4399-web-js-sdk/panel/index.css', 'utf8')) + "",
    template: FS.readFileSync(Editor.url('packages://plugin-4399-web-js-sdk/panel/index.html', 'utf8')) + "",

    $: {
        logTextArea: '#logTextArea',
    },

    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };
        // Editor.Ipc.sendToMain('plugin-4399-web-js-sdk:clicked');
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
                this.initPlugin();
            },
            data: {
                gameName: "",
                gameID: "",
                gameWidth: "",
                gameHeight: "",
                isAutoAddSdk: false,
                logView: [],
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                initPlugin() {
                    CfgUtil.initCfg(function (data) {
                        if (data) {
                            this.gameName = data.gameName;
                            this.gameWidth = data.gameWidth;
                            this.gameHeight = data.gameHeight;
                            this.gameID = data.gameID;
                            this.isAutoAddSdk = data.isAutoAddSdk || false;
                        }
                    }.bind(this))
                },
                clickAutoAddSdk() {
                    this.isAutoAddSdk = !this.isAutoAddSdk;
                    CfgUtil.setIsAutoAddSDK(this.isAutoAddSdk);
                },
                onChangeGameName() {
                    CfgUtil.setGameName(this.gameName);
                },
                onChangeGameID() {
                    if (this._isNum(this.gameID)) {
                        CfgUtil.setGameID(this.gameID);
                    } else {
                        this._addLog("gameID 必须是数字");
                        this.gameID = null;
                    }
                },
                _isNum(str) {
                    let reg = /^[0-9]+.?[0-9]*$/;
                    if (reg.test(str)) {
                        return true;
                    } else {
                        return false;
                    }
                },
                onChangeGameSize() {
                    if (!this._isNum(this.gameWidth)) {
                        this.gameWidth = null;
                        this._addLog("gameWidth 必须是数字");
                        return;
                    }
                    if (!this._isNum(this.gameHeight)) {
                        this.gameHeight = null;
                        this._addLog('gameHeight 必须是数字');
                        return;
                    }
                    CfgUtil.setGameSize(this.gameWidth, this.gameHeight);
                },
                onBuildFinished() {
                    if (this.isAutoAddSdk) {
                        this._addLog("构建完成,正在自动添加SDK");
                        this.onAdd4399Sdk(null);
                    }
                },
                onAdd4399Sdk(event) {
                    // 参数判断
                    if (!this.gameName || this.gameName.length === 0) {
                        this._addLog("游戏名字未填写");
                        return;
                    }

                    if (!this.gameID || this.gameID.length === 0) {
                        this._addLog("游戏ID未填写");
                        return;
                    }

                    if (!this.gameWidth || this.gameWidth <= 0) {
                        this._addLog("游戏宽度未填写");
                        return;
                    }
                    if (!this.gameHeight || this.gameHeight <= 0) {
                        this._addLog("游戏高度未填写");
                        return;
                    }
                    // sdk添加
                    let util = require('util');
                    let initScript = util.format("h5api.initGame(%s, \"%s\",%d, %d);window.moreGame=function(){h5api.moreGame();};",
                        this.gameID, this.gameName, this.gameWidth, this.gameHeight);

                    //获取构建平台
                    let rootDir = Editor.libraryPath.split("library")[0];
                    let localBuilderFilePath = PATH.join(rootDir, 'local/builder.json');
                    if (FS.existsSync(localBuilderFilePath)) {
                        let data = JSON.parse(FS.readFileSync(localBuilderFilePath, 'utf-8'));
                        let buildDir = PATH.join(rootDir, data.buildPath);
                        if (!FS.existsSync(buildDir)) {
                            this._addLog("构建目录不存在,请重新构建项目: " + buildDir);
                        } else {
                            // 查找判断平台
                            if (data.platform === "web-mobile" || data.platform === "web-desktop") {
                                let platformRootDir = PATH.join(buildDir, data.platform);
                                //搜索main.js
                                let mainJSFile = PATH.join(platformRootDir, "main.js");
                                if (FS.existsSync(mainJSFile)) {
                                    // 添加initScript
                                    let mainJSFileData = FS.readFileSync(mainJSFile, 'utf-8');
                                    let index1 = mainJSFileData.indexOf('h5api.initGame');
                                    let index2Str = 'window.moreGame=function(){h5api.moreGame();};';
                                    let index2 = mainJSFileData.indexOf(index2Str);
                                    if (index1 >= 0 && index2 >= 0) {
                                        let began = mainJSFileData.slice(0, index1);
                                        let end = mainJSFileData.slice(index2 + index2Str.length, mainJSFileData.length);
                                        mainJSFileData = began + initScript + end;
                                        console.log("update main.js");
                                    } else {
                                        if (mainJSFileData.indexOf(initScript) >= 0) {
                                            // 已经添加过
                                            console.log("add sdk finished");
                                        } else {
                                            mainJSFileData = mainJSFileData.replace("'use strict';", "'use strict';\n\t" + initScript);
                                            console.log("init api over");
                                        }
                                    }

                                    // 添加进度api
                                    let script2 = "h5api.progress(percent, \"正在加载中...\");";
                                    if (mainJSFileData.indexOf(script2) >= 0) {
                                        console.log("add api progress code finished");
                                    } else {
                                        let baseStr = "progressBar.style.width = percent.toFixed(2) + '%';";
                                        mainJSFileData = mainJSFileData.replace(baseStr, baseStr + script2);
                                        console.log("init api progress over");
                                    }
                                    FS.writeFileSync(mainJSFile, mainJSFileData);
                                } else {
                                    this._addLog("添加SDK失败,文件不存在: " + mainJSFile);
                                }
                                // 添加html代码
                                let indexHtmlFile = PATH.join(platformRootDir, 'index.html');
                                if (FS.existsSync(indexHtmlFile)) {
                                    let script3 = "<script src=\"http://stat.api.4399.com/h5api/h5api.php\"></script>";
                                    let indexHtmlFileData = FS.readFileSync(indexHtmlFile, 'utf-8');
                                    if (indexHtmlFileData.indexOf(script3) >= 0) {
                                        console.log("add html code finished");
                                    } else {
                                        let baseStr = "<body>";
                                        let newStr = indexHtmlFileData.replace(baseStr, baseStr + "\n" + script3);
                                        FS.writeFileSync(indexHtmlFile, newStr);
                                        console.log("init html code over");
                                    }
                                } else {
                                    this._addLog("添加SDK失败,文件不存在: " + indexHtmlFile);
                                }
                                this._addLog("生成成功.");
                            } else {
                                this._addLog("SDK不支持该平台:" + data.platform);
                            }
                        }
                    } else {
                        this._addLog("请构建项目!");
                    }
                },
            },
        })
    },

    messages: {
        'plugin-4399-web-js-sdk:onBuildFinished'(event) {
            window.plugin.onBuildFinished();
        }
    }
});