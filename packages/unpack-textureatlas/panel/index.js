let packageName = "unpack-textureatlas";
let fs = require('fire-fs');
let path = require('fire-path');
let Electron = require('electron');
let fs_extra = require('fs-extra');
let Sharp = require(Editor.url('unpack://utils/sharp'));
const Del = require('del');
let co = Editor.require('packages://' + packageName + '/node_modules/co');

let item = Editor.require('packages://' + packageName + '/panel/item/item.js');
const Async = require('async');

let toFilePromise = function (sharpObj, savePath, callback) {
    return new Promise(function (resolve, reject) {
        sharpObj.toFile(savePath, function (error) {
            if (error) {
                console.log(error);
                reject(error);
                return;
            }
            callback && callback(error);
            resolve();
        })
    })
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
        item.init();
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this.onBtnClickRefreshProject();

            },
            init() {
            },
            data: {
                logView: "",

                itemArray: [
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
                onBtnClickTest() {
                    this.onBtnClickRefreshProject();
                },
                // 刷新项目plist文件
                onBtnClickRefreshProject() {
                    Editor.assetdb.deepQuery(function (err, results) {
                        let num = 0;
                        results.forEach(function (result) {
                            if (result.extname === '.plist') {
                                // console.log(result);
                                num++;
                            }
                        });
                        console.log(num);
                    });
                    Editor.assetdb.queryAssets('db://assets/**\/*', ["sprite-atlas"], function (err, results) {
                        this.itemArray = [];
                        results.forEach(function (result) {
                            let ext = path.extname(result.path);
                            if (ext === '.plist') {
                                this.itemArray.push(result);
                            }
                        }.bind(this));

                    }.bind(this));


                },
                // 拆分所有的plist
                onBtnClickDealAllPlist() {
                    this.splitPlist(this.itemArray);
                },
                // 拆分单个plist
                onSplitItemPlist(data) {
                    this.splitPlist([data]);
                },
                splitPlist(dataArr) {
                    co(function* () {
                        for (let i = 0; i < dataArr.length; i++) {
                            let selectionUUid = dataArr[i].uuid;
                            let selectionMeta = Editor.remote.assetdb.loadMetaByUuid(selectionUUid);
                            let selectionUrl = Editor.remote.assetdb.uuidToUrl(selectionUUid);
                            let assetInfo = Editor.remote.assetdb.assetInfoByUuid(selectionUUid);
                            const textureAtlasPath = Editor.remote.assetdb.uuidToFspath(selectionMeta.rawTextureUuid);

                            if (!textureAtlasPath) {
                                console.log('图集纹理不存在！');
                                return;
                            }
                            let textureAtlasSubMetas = selectionMeta.getSubMetas();

                            if (assetInfo.type === 'sprite-atlas'
                                && selectionMeta.type === 'Texture Packer'
                                && textureAtlasSubMetas) {

                                let extractedImageSaveFolder = path.join(Editor.projectInfo.path, 'temp', path.basenameNoExt(textureAtlasPath) + '_unpack');
                                if (!fs.existsSync(extractedImageSaveFolder)) {
                                    fs.mkdirsSync(extractedImageSaveFolder);
                                }

                                let spriteFrameNames = Object.keys(textureAtlasSubMetas);
                                for (let j = 0; j < spriteFrameNames.length; j++) {
                                    let spriteFrameName = spriteFrameNames[j];
                                    let spriteFrameObj = textureAtlasSubMetas[spriteFrameName];
                                    let isRotated = spriteFrameObj.rotated;
                                    let originalSize = cc.size(spriteFrameObj.rawWidth, spriteFrameObj.rawHeight);
                                    let rect = cc.rect(spriteFrameObj.trimX, spriteFrameObj.trimY, spriteFrameObj.width, spriteFrameObj.height);
                                    let offset = cc.p(spriteFrameObj.offsetX, spriteFrameObj.offsetY);

                                    let trimmedLeft = offset.x + (originalSize.width - rect.width) / 2;
                                    let trimmedRight = (originalSize.width - rect.width) / 2 - offset.x;
                                    let trimmedTop = (originalSize.height - rect.height) / 2 - offset.y;
                                    let trimmedBottom = offset.y + (originalSize.height - rect.height) / 2;

                                    trimmedLeft = trimmedLeft <= 0 ? 0 : Math.floor(trimmedLeft);
                                    trimmedBottom = trimmedBottom <= 0 ? 0 : Math.floor(trimmedBottom);
                                    trimmedRight = trimmedRight <= 0 ? 0 : Math.floor(trimmedRight);
                                    trimmedTop = trimmedTop <= 0 ? 0 : Math.floor(trimmedTop);

                                    let sharpCallback = function (err) {
                                        if (err) {
                                            console.error('Generating ' + spriteFrameName + ' error occurs, details:' + err);
                                        } else {
                                            console.log(' 生成成功：' + spriteFrameName);
                                        }
                                    };

                                    // console.log("frame: " + spriteFrameName);
                                    let extractedSmallPngSavePath = path.join(extractedImageSaveFolder, spriteFrameName);
                                    if (isRotated) {
                                        let img = Sharp(textureAtlasPath).extract({
                                            left: rect.x,
                                            top: rect.y,
                                            width: rect.height,
                                            height: rect.width
                                        })
                                            .background('rgba(0,0,0,0)')
                                            .extend({
                                                top: trimmedTop,
                                                bottom: trimmedBottom,
                                                left: trimmedLeft,
                                                right: trimmedRight
                                            })
                                            .rotate(270);
                                        yield toFilePromise(img, extractedSmallPngSavePath, sharpCallback);
                                        // img.toFile(extractedSmallPngSavePath, sharpCallback);
                                    } else {
                                        let img = Sharp(textureAtlasPath).extract({
                                            left: rect.x,
                                            top: rect.y,
                                            width: rect.width,
                                            height: rect.height
                                        })
                                            .background('rgba(0,0,0,0)')
                                            .extend({
                                                top: trimmedTop,
                                                bottom: trimmedBottom,
                                                left: trimmedLeft,
                                                right: trimmedRight
                                            })
                                            .rotate(0);
                                        yield toFilePromise(img, extractedSmallPngSavePath, sharpCallback);
                                        // img.toFile(extractedSmallPngSavePath, sharpCallback);
                                    }
                                }
                                let curPlist = path.basenameNoExt(assetInfo.path);
                                this._addLog(`[${i + 1}/${dataArr.length}] (${curPlist}) 图集拆分数量： ${spriteFrameNames.length}`);
                                yield importPromise([extractedImageSaveFolder], path.dirname(selectionUrl),
                                    true, function (results) {
                                        // console.log(results);
                                        Del(extractedImageSaveFolder, {force: true});
                                        this.onBtnClickRefreshProject();
                                    }.bind(this));
                            } else {
                                console.log("没有选择资源");
                            }
                        }
                        this._addLog("-----  拆分完成 -----");
                    }.bind(this));
                },
                testFunc() {
                    let fileData = fs.readFileSync(data.path, 'utf-8');
                    let json = plist.parse(fileData);
                    console.log(json);
                    let pngFileName = json.metadata.textureFileName;
                    let relativePath = data.path.replace(/\\/g, '/');
                    let fileDir = path.dirname(relativePath);
                    let pngFilePath = path.join(fileDir, pngFileName);
                    if (!fs.existsSync(pngFilePath)) {
                        this._addLog("plist图片不存在： " + pngFilePath);
                        return;
                    }
                    // 设置存放目录
                    let saveDir = path.join(fileDir, path.basenameNoExt(data.path) + '_unpack');
                    if (!fs.existsSync(saveDir)) {
                        fs.mkdirSync(saveDir);
                    }

                    function decodeSizeString(str) {
                        let tmp = str.substring(1, str.length - 1);
                        let arr = tmp.split(',');
                        return arr;
                    }

                    function decodeFramesString(str) {
                        let ret = null;
                        let arr = decodeSizeString(str);
                        if (arr.length > 0) {
                            ret = decodeSizeString(arr[0]);
                        }
                        return ret;
                    }

                    for (let key in json.frames) {
                        let itemPngName = key;

                        // sourceSize
                        let itemPngSizeString = json.frames[key].sourceSize;
                        let itemPngSize = {width: 0, height: 0};
                        let size1 = itemPngSizeString.replace(/{/g, '[').replace(/}/g, ']');
                        size1 = JSON.parse(size1);
                        itemPngSize.width = size1[0];
                        itemPngSize.height = size1[1];

                        // frameSize
                        let itemPngFrameString = json.frames[key].frame;
                        let itemPngFrame = {x: 0, y: 0};
                        let size2 = itemPngFrameString.replace(/{/g, '[').replace(/}/g, ']');
                        size2 = JSON.parse(size2);
                        itemPngFrame.x = size2[0][0];
                        itemPngFrame.y = size2[0][1];

                        let rotated = json.frames[key].rotated;
                        let offset = json.frames[key].offset;

                        let smallPngSavePath = path.join(saveDir, itemPngName.replace(/\//g, '-'));
                        if (rotated) {

                        } else {

                            Sharp(pngFilePath).extract({
                                left: itemPngFrame.x,
                                top: itemPngFrame.y,
                                width: itemPngSize.width,
                                height: itemPngSize.height
                            })
                            // .background('rgba(0,0,0,0)')
                            // .extend({
                            //     top: trimmedTop,
                            //     bottom: trimmedBottom,
                            //     left: trimmedLeft,
                            //     right: trimmedRight
                            // })
                                .rotate(0)
                                .toFile(smallPngSavePath, function (err) {
                                    if (err) {
                                        console.log(err);

                                    } else {
                                        console.log("over: " + smallPngSavePath);
                                        let dir
                                        Editor.assetdb.refresh();
                                    }
                                });
                        }
                        break;
                    }
                }
            }
        });
    }
});