let packageName = "mp3-compress";
let fs = require('fire-fs');
let path = require('fire-path');
let Electron = require('electron');
let fs_extra = require('fs-extra');
let lameJs = Editor.require('packages://' + packageName + '/node_modules/lamejs');
let co = Editor.require('packages://' + packageName + '/node_modules/co');
let child_process = require('child_process');
let mp3item = Editor.require('packages://' + packageName + '/panel/item/mp3item.js');

// 同步执行exec
child_process.execPromise = function (cmd, options, callback) {
    return new Promise(function (resolve, reject) {
        child_process.exec(cmd, options, function (err, stdout, stderr) {
            // console.log("执行完毕!");
            if (err) {
                console.log(err);
                callback && callback(stderr);
                reject(err);
                return;
            }
            resolve();
        })
    });
};

Editor.Panel.extend({

    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",


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
        mp3item.init();
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this._getLamePath();
                this.onBtnClickGetProjectMusic();
            },
            init() {
            },
            data: {
                logView: "",
                mp3Path: null,
                lameFilePath: null,// lame程序路径

                mp3Array: [
                    {uuid: "88a33018-0323-4c25-9b0c-c54f147f5dd8"},
                ],
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                onBtnClickCompressAll() {
                    console.log("压缩整个项目音频文件");
                    this._compressMp3(this.mp3Array);
                },
                // 检索项目中的声音文件mp3类型
                onBtnClickGetProjectMusic() {
                    this.mp3Array = [];
                    Editor.assetdb.queryAssets('db://assets/**\/*', 'audio-clip', function (err, results) {
                        results.forEach(function (result) {
                            let ext = path.extname(result.path);
                            if (ext === '.mp3') {
                                this.mp3Array.push(result);
                            }
                        }.bind(this));
                    }.bind(this));
                },
                onItemCompress(data) {
                    console.log("onItemCompress");
                    // 进行压缩
                    this._compressMp3([data]);
                },
                _getLamePath() {
                    let lamePath = null;
                    let lameBasePath = path.join(Editor.projectInfo.path, "packages/mp3-compress/file");
                    let runPlatform = cc.sys.os;
                    if (runPlatform === "Windows") {
                        lamePath = path.join(lameBasePath, 'lame.exe');
                    } else if (runPlatform === "OS X") {
                        // 添加执行权限
                        lamePath = path.join(lameBasePath, 'lame');
                        let cmd = "chmod u+x " + lamePath;
                        child_process.exec(cmd, null, function (err) {
                            if(err){
                                console.log(err);
                            }
                            //console.log("添加执行权限成功");
                        }.bind(this));
                    }
                    return lamePath;
                },
                _getTempMp3Dir() {
                    let userPath = Electron.remote.app.getPath('userData');
                    let tempMp3Dir = path.join(userPath, "/mp3Compress");// 临时目录
                    return tempMp3Dir;
                },
                _compressMp3(fileDataArray) {
                    // 设置lame路径
                    let lamePath = this._getLamePath();
                    if (!fs.existsSync(lamePath)) {
                        this._addLog("文件不存在: " + lamePath);
                        return;
                    }
                    console.log("压缩");
                    co(function* () {
                        // 处理要压缩的音频文件
                        for (let i = 0; i < fileDataArray.length; i++) {
                            let voiceFile = fileDataArray[i].path;
                            let voiceFileUrl = fileDataArray[i].url;
                            if (!fs.existsSync(voiceFile)) {
                                this._addLog("声音文件不存在: " + voiceFile);
                                return;
                            }

                            if (path.extname(voiceFile) === ".mp3") {
                                // 检测临时缓存目录
                                let tempMp3Dir = this._getTempMp3Dir();// 临时目录
                                if (!fs.existsSync(tempMp3Dir)) {
                                    fs.mkdirSync(tempMp3Dir);
                                }
                                console.log("mp3目录: " + tempMp3Dir);
                                let dir = path.dirname(voiceFile);
                                let arr = voiceFile.split('.');
                                let fileName = arr[0].substr(dir.length + 1, arr[0].length - dir.length);
                                let tempMp3Path = path.join(tempMp3Dir, 'temp_' + fileName + '.mp3');

                                // 压缩mp3
                                let cmd = `${lamePath} -V 0 -q 0 -b 45 -B 80 --abr 64 "${voiceFile}" "${tempMp3Path}"`;
                                console.log("------------------------------exec began" + i);
                                yield child_process.execPromise(cmd, null, function (err) {
                                    this._addLog("出现错误: \n" + err);
                                }.bind(this));
                                console.log("------------------------------exec end" + i);
                                // 临时文件重命名
                                let newNamePath = path.join(tempMp3Dir, fileName + '.mp3');
                                fs.renameSync(tempMp3Path, newNamePath);
                                this._addLog(`压缩成功: ${voiceFileUrl} `);

                                let fullFileName = fileName + '.mp3';
                                let url = voiceFileUrl.substr(0, voiceFileUrl.length - fullFileName.length - 1);

                                // 导入到项目原位置
                                Editor.assetdb.import([newNamePath], url,
                                    function (err, results) {
                                        console.log("11111111111111111");
                                        results.forEach(function (result) {
                                            console.log(result.path);
                                            // result.uuid
                                            // result.parentUuid
                                            // result.url
                                            // result.path
                                            // result.type
                                        });
                                    }.bind(this));

                            } else {
                                console.log("不支持的文件类型:" + voiceFile);
                            }
                        }
                        // TODO 删除临时目录的文件
                        // let dir = this._getTempMp3Dir();// 临时目录
                        // if (fs.existsSync(dir)) {
                        //     fs.unlinkSync(dir);// 删除临时文件
                        // }
                        this._addLog("处理完毕!");
                    }.bind(this));

                },

                onBtnCompress() {


                },
                dropFile(event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        console.log(file);
                        this.mp3Path = file;
                    } else {
                        console.log("no file");
                    }
                },
                drag(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // console.log("dragOver");
                },

            }
        });
    },

    messages: {
        'mp3-compress:hello'(event, target) {
            console.log("刷新文件列表");
            // 检测变动的文件里面是否包含mp3
            let b = false;
            for (let i = 0; i < target.length; i++) {
                let ext = require('fire-path').extname(target[i].path || target[i].destPath);
                if (ext === '.mp3') {
                    b = true;
                    break;
                }
            }
            if (b) {
                window.plugin.onBtnClickGetProjectMusic();
            } else {
                console.log("未发现音频文件,无需刷新:");
            }
        }
    }
});