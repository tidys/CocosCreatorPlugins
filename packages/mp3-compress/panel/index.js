let packageName = "res-compress";
let fs = require('fire-fs');
let path = require('fire-path');
let Electron = require('electron');
let fs_extra = require('fs-extra');
let lameJs = Editor.require('packages://' + packageName + '/node_modules/lamejs');
let co = Editor.require('packages://' + packageName + '/node_modules/co');
let child_process = require('child_process');
let mp3item = Editor.require('packages://' + packageName + '/panel/item/mp3item.js');
let image_item = Editor.require('packages://' + packageName + '/panel/item/image-item.js');
let imageMin = Editor.require('packages://' + packageName + '/node_modules/imagemin');
let imageminPngquant = Editor.require('packages://' + packageName + '/node_modules/imagemin-pngquant');
let imageminJpegtran = Editor.require('packages://' + packageName + '/node_modules/imagemin-jpegtran');
let imageminJpegRecompress = Editor.require('packages://' + packageName + '/node_modules/imagemin-jpeg-recompress');


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
let importPromise = function (path, url, isShowProcess, callBack) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.import(path, url, isShowProcess, function (err, results) {
            if (err) {
                console.log(err);
                reject(err);
            }
            callBack && callBack(results);
            resolve();
            return results;
        })
    });
};
let queryAssetsPromise = function (url, type, callBack) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.queryAssets(url, type, function (err, results) {
            if (err) {
                console.log(err);
                reject(err);
            }
            callBack && callBack(results);
            resolve();
            return results;
        })
    })
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
        image_item.init();
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this._getLamePath();
                this.onBtnClickGetProject();
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
                imageArray: [],
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                onBtnClickCompressAllMusic() {
                    console.log("压缩整个项目音频文件");
                    this._compressMp3(this.mp3Array);
                },
                onBtnClickCompressAllImage() {
                    console.log("压缩整个项目图片文件");
                    this._compressImage(this.imageArray);
                },
                // 检索项目中的声音文件mp3类型
                onBtnClickGetProject(event) {
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    this.mp3Array = [];
                    this.imageArray = [];
                    // co(function* () {
                    //     console.log("11");
                    //     yield queryAssetsPromise('db://assets/**\/*', ['audio-clip', 'texture'], function (results) {
                    //         results.forEach(function (result) {
                    //             let ext = path.extname(result.path);
                    //             if (ext === '.mp3') {
                    //                 this.mp3Array.push(result);
                    //             } else if (ext === '.png' || ext === '.jpg') {
                    //                 this.imageArray.push(result);
                    //             }
                    //         }.bind(this));
                    //         console.log("222");
                    //     }.bind(this));
                    // }.bind(this));
                    // return;
                    Editor.assetdb.queryAssets('db://assets/**\/*', ['audio-clip', 'texture'], function (err, results) {
                        this.mp3Array = [];
                        this.imageArray = [];
                        results.forEach(function (result) {
                            let ext = path.extname(result.path);
                            if (ext === '.mp3') {
                                this.mp3Array.push(result);
                            } else if (ext === '.png' || ext === '.jpg') {
                                this.imageArray.push(result);
                            }
                        }.bind(this));
                        // 按照字母排序
                        this._sortArr(this.mp3Array);
                        this._sortArr(this.imageArray);
                    }.bind(this));
                },
                _sortArr(arr) {
                    arr.sort(function (a, b) {
                        let pathA = a.url;
                        let pathB = b.url;
                        let extA = path.basename(pathA);
                        let extB = path.basename(pathB);
                        let numA = extA.charCodeAt(0);
                        let numB = extB.charCodeAt(0);
                        return numA - numB;
                    })
                },
                onMusicItemCompress(data) {
                    // 进行压缩
                    console.log("音频压缩");
                    this._compressMp3([data]);
                },
                onImageItemCompress(data) {
                    console.log("图片压缩");
                    this._compressImage([data]);
                },
                _compressImage(dataArr) {
                    let tmp = this._getTempMp3Dir();
                    co(function* () {
                        for (let i = 0; i < dataArr.length; i++) {
                            let data = dataArr[i];
                            // todo 对于图片格式的判断
                            let files = yield imageMin([data.path], tmp, {
                                plugins: [
                                    imageminJpegRecompress({
                                        accurate: true,//高精度模式
                                        quality: "high",//图像质量:low, medium, high and veryhigh;
                                        method: "smallfry",//网格优化:mpe, ssim, ms-ssim and smallfry;
                                        min: 70,//最低质量
                                        loops: 0,//循环尝试次数, 默认为6;
                                        progressive: false,//基线优化
                                        subsample: "default"//子采样:default, disable;
                                    }),
                                    imageminJpegtran(),
                                    imageminPngquant({quality: '65-80'})
                                ]
                            });
                            this._addLog("压缩成功 [" + (i + 1) + "/" + dataArr.length + "]:" + data.url);
                            // 导入到项目原位置
                            let newNamePath = files[0].path;
                            let name = path.basename(newNamePath);
                            let url = data.url.substr(0, data.url.length - name.length - 1);

                            yield importPromise([newNamePath], url, true, function (results) {
                                results.forEach(function (result) {
                                    if (result.type === "texture") {
                                        console.log("del: " + result.path);
                                        if (fs.existsSync(newNamePath)) {
                                            fs.unlinkSync(newNamePath);// 删除临时文件
                                        }
                                    }
                                });
                            }.bind(this));

                        }
                        this._addLog("压缩完毕!");
                    }.bind(this));
                },
                _getLamePath() {
                    let lamePath = null;
                    let lameBasePath = path.join(Editor.projectInfo.path, "packages/res-compress/file");
                    let runPlatform = cc.sys.os;
                    if (runPlatform === "Windows") {
                        lamePath = path.join(lameBasePath, 'lame.exe');
                    } else if (runPlatform === "OS X") {
                        // 添加执行权限
                        lamePath = path.join(lameBasePath, 'lame');
                        let cmd = "chmod u+x " + lamePath;
                        child_process.exec(cmd, null, function (err) {
                            if (err) {
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
                                this._addLog(`压缩成功 [${(i + 1)}/${fileDataArray.length}] : ${voiceFileUrl} `);

                                let fullFileName = fileName + '.mp3';
                                let url = voiceFileUrl.substr(0, voiceFileUrl.length - fullFileName.length - 1);

                                // 导入到项目原位置
                                yield  importPromise([newNamePath], url, true,
                                    function (results) {
                                        results.forEach(function (result) {
                                            //   删除临时目录的文件
                                            // console.log("type: " + result.type);
                                            if (result.type = "audio-clip") {
                                                console.log("del: " + result.path);
                                                if (fs.existsSync(newNamePath)) {
                                                    fs.unlinkSync(newNamePath);// 删除临时文件
                                                }
                                            }
                                        });
                                    }.bind(this));

                            } else {
                                console.log("不支持的文件类型:" + voiceFile);
                            }
                        }
                        this._addLog("处理完毕!");
                    }.bind(this));
                },

                onBtnCompress() {
                    console.log("test");
                    this.onBtnClickGetProject(null);
                    this.onBtnClickGetProject(null);
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
        'res-compress:hello'(event, target) {
            console.log("刷新文件列表");
            // 检测变动的文件里面是否包含mp3
            let b = false;
            for (let i = 0; i < target.length; i++) {
                let ext = require('fire-path').extname(target[i].path || target[i].destPath);
                if (ext === '.mp3' || ext === ".png" || ext === ".jpg") {
                    b = true;
                    break;
                }
            }
            if (b) {
                window.plugin.onBtnClickGetProject();
            } else {
                // console.log("未发现音频文件,无需刷新:");
            }
        }
    }
});