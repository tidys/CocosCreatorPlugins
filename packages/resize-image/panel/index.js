let packageName = "resize-image";
let Electron = require('electron');
let fs = require("fire-fs");
let path = require('fire-path');
Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",


    $: {},

    ready() {
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this.onSelectChange({detail: {value: "1"}});
            },
            init() {
            },
            data: {
                imgPath: null,
                sizeHeight: 0,
                sizeWidth: 0,
                isLandSpace: false,// 默认竖屏
            },
            methods: {
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
                onBtnClickResize() {
                    console.log("resize");
                    if (!this.imgPath) {
                        console.log("没有添加图片");
                        return;
                    }

                    if (this.sizeWidth === 0 || this.sizeHeight === 0) {
                        console.log("图片宽高有问题");
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
                    let fileName = path.basename(this.imgPath);
                    let desFilePath = path.join(pixDir, fileName);

                    sharp(this.imgPath).resize(this.sizeWidth, this.sizeHeight).toFile(desFilePath, (err, info) => {
                        if (err) {
                            // Editor.warn("error:"+err);
                            console.log("error:" + err);
                            console.log("info: " + info);

                        }
                    });
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