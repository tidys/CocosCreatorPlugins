let packageName = "resize-image";
let Electron = require('electron');
let fs = require("fire-fs");
let path = require('fire-path');
let imageItem = Editor.require('packages://' + packageName + '/panel/item/item.js');
Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",


    $: {
        logTextArea: '#logTextArea',
        container: '#container',
        view: '#view',
        section: '#section'
    },

    ready() {

        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };
        let view = this.$view;
        let container = this.$container;
        let section = this.$section;
        let resizeScroll = function () {
            if (container && view && container.scrollHeight < view.clientHeight) {
                section.style.height = (view.clientHeight - 30) + 'px';
                container.style.height = (view.clientHeight - 15) + 'px';
            }
        };
        // 注册自定义组件
        imageItem.init();
        window.addEventListener('resize', function () {
            resizeScroll();
        });
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                resizeScroll();
                this.onSelectChange({detail: {value: "1"}});
            },
            init() {
            },
            data: {
                logView: [],
                imgPath: null,
                sizeHeight: 0,
                sizeWidth: 0,
                isLandSpace: false,// 默认竖屏

                resizeImageArray: [{path: "test"}],
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                delImage(itemCfg) {
                    if (!itemCfg) {
                        console.log("删除失败");
                        return;
                    }
                    for (let i = 0; i < this.resizeImageArray.length; i++) {
                        let item = this.resizeImageArray[i];
                        if (item.path === itemCfg.path) {
                            this.resizeImageArray.splice(i, 1);
                            console.log("del: " + item.path);
                        }
                    }
                },
                dropFile(event) {
                    event.preventDefault();
                    console.log("drop");
                    for (let i = 0; i < event.dataTransfer.files.length; i++) {
                        let file = event.dataTransfer.files[i];
                        let filePath = file.path;
                        if (file.type === "image/png" || file.type === "image/jpeg") {
                            // 判断是否有重复的图片
                            if (this._isSameFileExist(filePath)) {
                                console.log("已经存在该图片: " + filePath);
                            } else {
                                this.resizeImageArray.push({path: filePath});
                            }
                        } else {
                            this._addLog("不能识别文件: " + filePath);
                        }
                    }
                },
                _isSameFileExist(file) {
                    let b = false;
                    for (let i = 0; i < this.resizeImageArray.length; i++) {
                        if (this.resizeImageArray[i].path === file) {
                            b = true;
                            break;
                        }
                    }
                    return b;
                },
                drag(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // console.log("dragOver");
                },
                _getTempDir() {
                    let userPath = Electron.remote.app.getPath('userData');
                    return path.join(userPath, "/resizeImage");// 临时目录
                },
                onBtnClickOpenDir() {
                    let openDir = null;

                    let tmpDir = this._getTempDir();
                    let pixDir = path.join(tmpDir, this.sizeWidth + "x" + this.sizeHeight);
                    if (fs.existsSync(pixDir)) {
                        openDir = pixDir;
                    } else if (fs.existsSync(tmpDir)) {
                        openDir = tmpDir;
                    }
                    if (openDir) {
                        Electron.shell.showItemInFolder(openDir);
                        Electron.shell.beep();
                    } else {
                        console.log("目录错误: " + openDir);
                    }
                },
                onBtnClickCleanTmpDir() {
                    let rimraf = require('rimraf');
                    let dir = this._getTempDir();
                    if (fs.existsSync(dir)) {
                        rimraf.sync(dir);
                        console.log("清空目录成功: " + dir);
                    }
                },
                _resizeImage(imgPath) {
                    if (!imgPath) {
                        this._addLog("图片路径有误: " + imgPath);
                        return;
                    }

                    let sharpPath = Editor.url('unpack://utils/sharp');
                    let sharp = require(sharpPath);

                    // 创建相应尺寸的目录
                    let desDir = this._getTempDir();
                    if (!fs.existsSync(desDir)) {
                        fs.mkdirSync(desDir);
                    }
                    let pixDir = path.join(desDir, this.sizeWidth + "x" + this.sizeHeight);
                    if (!fs.existsSync(pixDir)) {
                        fs.mkdirSync(pixDir);
                    }
                    let fileName = path.basename(imgPath);
                    let desFilePath = path.join(pixDir, fileName);

                    sharp(imgPath).resize(this.sizeWidth, this.sizeHeight).toFile(desFilePath, function (err, info) {
                        if (err) {
                            this._addLog("裁剪失败!");
                            // Editor.warn("error:"+err);
                            console.log("error:" + err);
                            console.log("info: " + info);
                        } else {
                            this._addLog("剪裁成功: " + imgPath);
                        }
                    }.bind(this));
                },
                onBtnClickResize() {
                    console.log("resize");
                    if (this.sizeWidth === 0 || this.sizeHeight === 0) {
                        this._addLog("裁切图片宽高设置有问题!");
                        return;
                    }

                    for (let i = 0; i < this.resizeImageArray.length; i++) {
                        let item = this.resizeImageArray[i];
                        this._resizeImage(item.path);
                    }
                },
                onSelectChange(event) {
                    let value = event.detail.value;
                    // console.log("change:" + value);
                    if (value === "1") {// 1125*2436
                        this._setSize(1125, 2436);
                    } else if (value === "2") {// 1242*2208
                        this._setSize(1242, 2208);
                    } else if (value === "3") {// 2048*2732
                        this._setSize(2048, 2732);
                    } else {
                        console.log("未发现该配置!");
                    }
                },
                _setSize(width, height) {
                    if (this.isLandSpace) {
                        this.sizeWidth = height;
                        this.sizeHeight = width;
                    } else {
                        this.sizeWidth = width;
                        this.sizeHeight = height;
                    }
                },
                onChangeLandSpace(event) {
                    this.isLandSpace = !this.isLandSpace;
                    event.currentTarget.innerText = this.isLandSpace ? "横屏" : "竖屏";
                    let tmp = this.sizeHeight;
                    this.sizeHeight = this.sizeWidth;
                    this.sizeWidth = tmp;
                },
                onBtnClickSelectPicture() {
                    let res = Editor.Dialog.openFile({
                        title: "选择要裁剪的图片",
                        defaultPath: Editor.projectInfo.path,
                        filters: [
                            {
                                name: `image File`,
                                extensions: ["png", "jpg"]
                            }
                        ],
                        properties: ['openFile'],
                    });
                    if (res !== -1) {
                        this.imgPath = res[0];
                    }
                },

            }
        });
    },

    messages: {
        'resize-image:hello'(event) {
        }
    }
});