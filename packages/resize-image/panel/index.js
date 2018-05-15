let packageName = "resize-image";
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
                    let des = "C:\\Users\\cocos dev\\Desktop\\image";
                    des =path.join(des,"ts.png");
                    sharp(this.imgPath).resize(this.sizeWidth, this.sizeHeight).toFile(des, (err, info) => {
                        if (err) {
                            // Editor.warn("error:"+err);
                            console.log("error:" + err);
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