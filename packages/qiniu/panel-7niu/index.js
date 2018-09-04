let fs = require('fire-fs');
let path = require('fire-path');
let packageName = "";
const qn = Editor.require("packages://qiniu/node_modules/qn");
Editor.require("packages://qiniu/panel-7niu/file-item.js")();

Editor.Panel.extend({
    style: fs.readFileSync(Editor.url("packages://qiniu/panel-7niu/index.css"), "utf-8"),
    template: fs.readFileSync(Editor.url('packages://qiniu/panel-7niu/index.html'), "utf-8"),


    $: {},

    ready() {
        this.pluginQiNiu = new window.Vue({
            el: this.shadowRoot,
            created() {
                this._panelCreated();
            },
            init() {
            },
            data: {
                accessKey: null,
                secretKey: null,
                bucket: null,
                profile: null,
                isLogin: false,
                loginMask: false,

                storageAreaArray: [
                    {url: "http://up.qiniup.com/", name: "华东"},
                    {url: "http://up-z1.qiniup.com/", name: "华北"},
                    {url: "http://up-z2.qiniup.com/", name: "华南"},
                    {url: "http://up-na0.qiniup.com/", name: "北美"},
                    {url: "http://up-as0.qiniup.com/", name: "东南亚"},
                ],
                storageArea: "http://up.qiniu.com/",// 存储区域,默认华东
                tips: "",

                uploadBtnStr: "",
                cleanBtnStr: "",

                lastOpenUploadDir: null,

                fileItems: [],
            },
            methods: {
                _panelCreated() {
                    Editor.Profile.load("profile://project/7niu.json", function (error, profile) {
                        if (error) {
                            Editor.log(error);
                        } else {
                            this.profile = profile;
                            this.accessKey = profile.data['accessKey'];
                            this.secretKey = profile.data['secretKey'];
                            this.bucket = profile.data['bucket'];
                            this.lastOpenUploadDir = profile.data['lastOpenUploadDir'];
                            this.storageArea = profile.data['storageArea'] || this.storageArea;
                            // this.onBtnClickLogin();
                        }
                    }.bind(this));
                },
                onChangeStorageArea() {
                    this.profile.data['storageArea'] = this.storageArea;
                    this.profile.save();
                },
                getFileListInfo() {
                    if (this.fileItems) {
                        let len = this.fileItems.length;
                        let size = 0;
                        for (let i = 0; i < this.fileItems.length; i++) {
                            let itemSize = parseFloat(this.fileItems[i].fsize.toString());
                            size += itemSize;
                        }
                        let sizeStr = this.transformFileSize(size);
                        return `(数量: ${len}, 大小: ${sizeStr})`;
                    } else {
                        return "";
                    }
                },
                transformFileSize(size) {
                    let b = size / 1024;
                    if (b < 1) {
                        return (b * 1024).toFixed(2) + "b"
                    }
                    let m = b / 1024;
                    if (m < 1) {
                        return (m * 1024).toFixed(2) + "kb";
                    }
                    return m.toFixed(2) + "M";
                },
                onBtnClickRefresh() {
                    this.loginMask = true;
                    if (this.isLogin && this.client) {
                        this.client.list("/", function (error, result) {
                            console.log(result);
                            this.loginMask = false;
                            if (result.items) {
                                this.fileItems = result.items;
                            }
                        }.bind(this));
                    }
                },
                _uploadItemSuccess(result) {
                    let item = {key: result.key, fsize: result['x:size']};
                    let b = false;
                    for (let i = 0; i < this.fileItems.length; i++) {
                        let itemFile = this.fileItems[i];
                        if (itemFile.key === result.key) {
                            b = true;
                            break;
                        }
                    }
                    if (!b) {
                        this.fileItems.push(item);
                    }
                },
                getStorageAreaNameByUrl(url) {
                    for (let i = 0; i < this.storageAreaArray.length; i++) {
                        let item = this.storageAreaArray[i];
                        if (item.url.indexOf(url) >= 0) {
                            return item.name;
                        }
                    }
                    return "其他";
                },
                _uploadDir(rootDir) {
                    const globby = require('globby');
                    let pattern = path.join(rootDir, "**/*.*");
                    let results = globby.sync([pattern]);
                    let total = results.length;
                    this.$els.btn_upload.disabled = true;
                    uploadFile.apply(this, [results]);

                    function uploadFile(results) {
                        this.uploadBtnStr = `(${results.length}/${total})`;
                        if (results.length > 0) {
                            let item = results[0];
                            let uploadKey = path.relative(rootDir, item);

                            this.client.uploadFile(item, {
                                key: uploadKey
                            }, function (error, result) {
                                if (error) {
                                    console.log(error.message);
                                    let ret = error.message.replace('incorrect region, please use ', "");
                                    let areaName = this.getStorageAreaNameByUrl(ret);
                                    Editor.log(`可能选择的存储空间有误, 上传失败:${uploadKey},请尝试使用[${areaName}]重新上传`);
                                } else {
                                    console.log(result);
                                    this._uploadItemSuccess(result);
                                }
                                results.splice(0, 1);
                                uploadFile.apply(this, [results]);
                            }.bind(this));
                        } else {
                            console.log("上传完毕");
                            this.uploadBtnStr = "";
                            this.$els.btn_upload.disabled = false;
                        }
                    }


                },
                onBtnClickUpload() {
                    let res = Editor.Dialog.openFile({
                        defaultPath: this.lastOpenUploadDir || Editor.projectInfo.path,
                        properties: ['openDirectory', 'openFile']
                    });
                    if (res) {
                        let rootDir = res[0];
                        if (rootDir) {
                            if (fs.isDirSync(rootDir)) {
                                // 上传目录
                                // 记录上次打开的目录
                                this.lastOpenUploadDir = rootDir;
                                this.profile.data['lastOpenUploadDir'] = rootDir;
                                this.profile.save();

                                this._uploadDir(rootDir);
                            } else {
                                // 上传文件
                            }
                        }
                    }
                },
                onBtnClickClean() {
                    this.$els.btn_clean.disabled = true;
                    let len = this.fileItems.length;
                    if (len > 0) {
                        this.cleanBtnStr = `(${len})`;
                        let file = this.fileItems[0];
                        this.client.delete(file.key, function (error, data, msg) {
                            console.log("del: " + file.key);
                            this.fileItems.splice(0, 1);
                            this.onBtnClickClean();
                        }.bind(this));
                    } else {
                        this.$els.btn_clean.disabled = false;
                        this.cleanBtnStr = "";
                        console.log("删除完毕");
                    }
                },
                onBtnClickGetInfo() {
                    debugger;
                    let item = this.fileItems[0];
                    this.client.stat(item.key, function (error, data) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(data);
                        }
                    });


                    let url = `https://portal.qiniu.com/api/kodo/bucketinfo/${this.bucket}/default/domain`;
                    let xhr = new XMLHttpRequest();
                    xhr.open("GET", url);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            debugger;
                            xhr.response;

                        }
                    };
                    xhr.send();
                },
                onButtonTest() {


                },
                onBtnClickReturn() {
                    this.isLogin = false;
                    this.loginMask = false;
                },
                _getStorageAreaName(curStorageArea) {
                    for (let i = 0; i < this.storageAreaArray.length; i++) {
                        let item = this.storageAreaArray[i];
                        if (item.url === curStorageArea) {
                            return item.name;
                        }
                    }
                    return "";
                },
                onBtnClickLogin() {
                    this.loginMask = true;
                    if (this.bucket && this.accessKey && this.secretKey) {
                        let client = qn.create({
                            accessKey: this.accessKey,
                            secretKey: this.secretKey,
                            bucket: this.bucket,
                            origin: "http://" + this.bucket + ".u.qiniudn.com",
                            uploadURL: this.storageArea,
                        });
                        if (client) {
                            console.log("登录成功!");
                            client.list("/", function (error, result) {
                                this.loginMask = false;
                                if (error) {
                                    this.isLogin = false;
                                    console.log(error.message);
                                    let areaName = this._getStorageAreaName(this.storageArea);
                                    this._setTips(`该存储空间 [${areaName}] 不存在bucket [${this.bucket}]`);
                                } else {
                                    console.log(result);
                                    this.isLogin = true;
                                    if (result.items) {
                                        this.client = client;
                                        this.fileItems = result.items;
                                    }
                                }
                            }.bind(this));
                        }
                    }
                },
                _setTips(str) {
                    this.tips = str;
                    setTimeout(function () {
                        this.tips = "";
                    }.bind(this), 1300);
                },
                onChangeAccessKey() {
                    if (this.profile) {
                        this.profile.data['accessKey'] = this.accessKey;
                        this.profile.save();
                    }
                },
                onChangeSecretKey() {
                    if (this.profile) {
                        this.profile.data['secretKey'] = this.secretKey;
                        this.profile.save();
                    }
                },
                onChangeBucket() {
                    if (this.profile) {
                        this.profile.data['bucket'] = this.bucket;
                        this.profile.save();
                    }
                },
            },
        });
    },

    messages: {
        'msg'(event, menu) {
        },

    }
});