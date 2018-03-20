'use strict';

const Fs = require('fire-fs');
const Path = require('path');
const Electron = require('electron');
const App = Electron.remote.app;
const Async = require('async');
const Globby = require('globby');

const MacIconPath = 'frameworks/runtime-src/proj.ios_mac/mac/Icon.icns';
const WindowsIconPath = 'frameworks/runtime-src/proj.win32/res/game.ico';
const IOSIconsDir = 'frameworks/runtime-src/proj.ios_mac/ios';
const IOSIconAddDir = 'Images.xcassets/AppIcon.appiconset/';//creator1.7之后构建的工程是不同的
const IOSIconNamePattern = 'Icon-*.png';
const AndroidProjectInfo = [
    {
        resDir: 'frameworks/runtime-src/proj.android/res',
        iconFolderPattern: 'drawable*',
        iconName: 'icon.png'
    },
    {
        resDir: 'frameworks/runtime-src/proj.android-studio/app/res',
        iconFolderPattern: 'mipmap*',
        iconName: 'ic_launcher.png'
    }
];

Editor.Panel.extend({
    style: `
    @import url('app://bower_components/fontawesome/css/font-awesome.min.css');

    :host {
        margin: 10px 10px;
        display: flex;
        flex-direction: column;
        padding: 0 10px;
    }

    section {
        flex: 1;
        overflow-y: auto;
    }

    footer {
        padding: 10px 0;
        justify-content: flex-end;
    }
    `,

    template: `
    <section>
        <ui-prop name="${Editor.T('replace-icons.projProp')}">
            <ui-select class="flex-1" v-value="projPath">
                <template v-for="item in projNames">
                    <option v-bind:value="item.value">{{item.text}}</option>
                </template>
            </ui-select>
        </ui-prop>

        <ui-prop name="${Editor.T('replace-icons.platforms')}" auto-height>
            <div class="flex-1 layout horizontal">
                <ui-checkbox class="item" v-value="ios">
                    iOS
                </ui-checkbox>
                <ui-checkbox class="item" v-value="android">
                    Android
                </ui-checkbox>
                <ui-checkbox class="item" v-value="mac">
                    Mac
                </ui-checkbox>
                <ui-checkbox class="item" v-value="windows">
                    Windows
                </ui-checkbox>
            </div>
        </ui-prop>

        <ui-prop name="${Editor.T('replace-icons.pngPath')}"
                 v-disabled="!ios && !android"
                 tooltip="Select a png file as the new icon.">
            <div class="layout horizontal content flex-1">
                <ui-input class="flex-2"
                          v-value="pngPath">
                </ui-input>
                <ui-button class="small" id="choosePNG"
                           v-on:confirm="onChooseFile">
                        ···
                </ui-button>
                <ui-button class="small" id="showPNG"
                           v-on:confirm="onShowFile">
                        ${Editor.T('SHARED.open')}
                </ui-button>
            </div>
        </ui-prop>

        <ui-prop name="${Editor.T('replace-icons.icnsPath')}"
                 v-disabled="!mac"
                 tooltip="Select a icns file as the Mac App icon.">
            <div class="layout horizontal content flex-1">
                <ui-input class="flex-2"
                          v-value="icnsPath">
                </ui-input>
                <ui-button class="small" id="chooseICNS"
                           v-on:confirm="onChooseFile">
                        ···
                </ui-button>
                <ui-button class="small" id="showICNS"
                           v-on:confirm="onShowFile">
                        ${Editor.T('SHARED.open')}
                </ui-button>
            </div>
        </ui-prop>

        <ui-prop name="${Editor.T('replace-icons.icoPath')}"
                 v-disabled="!windows"
                 tooltip="Select a ico file as the Windows App icon.">
            <div class="layout horizontal content flex-1">
                <ui-input class="flex-2"
                          v-value="icoPath">
                </ui-input>
                <ui-button class="small" id="chooseICO"
                           v-on:confirm="onChooseFile">
                        ···
                </ui-button>
                <ui-button class="small" id="showICO"
                           v-on:confirm="onShowFile">
                        ${Editor.T('SHARED.open')}
                </ui-button>
            </div>
        </ui-prop>
    </section>

    <footer class="layout horizontal">
        <ui-button
            class="green"
            v-disabled="(!ios && !android && !mac && !windows) || !projPath"
            v-on:confirm="_onReplaceClick"
        >
            ${Editor.T('replace-icons.replace')}
        </ui-button>
    </footer>
    `,

    ready() {
        var vm = this._vm = new window.Vue({
            el: this.shadowRoot,
            data: {
                projPath: '',
                projNames: [],
                ios: false,
                android: false,
                mac: false,
                windows: false,
                pngPath: '',
                icnsPath: '',
                icoPath: ''
            },
            methods: {
                onChooseFile: function (event) {
                    event.stopPropagation();
                    var target = event.target;
                    var ext = '';
                    var defaultPath = '';
                    switch (target.id) {
                        case 'choosePNG':
                            ext = 'png';
                            defaultPath = this.pngPath;
                            break;
                        case 'chooseICNS':
                            ext = 'icns';
                            defaultPath = this.icnsPath;
                            break;
                        case 'chooseICO':
                            ext = 'ico';
                            defaultPath = this.icoPath;
                            break;
                        default:
                            break;
                    }

                    if (!ext) {
                        return;
                    }

                    let res = Editor.Dialog.openFile({
                        defaultPath: defaultPath,
                        filters: [
                            {
                                name: `.${ext} File`,
                                extensions: [ext]
                            }
                        ],
                        properties: ['openFile']
                    });
                    if (res && res[0]) {
                        switch (target.id) {
                            case 'choosePNG':
                                this.pngPath = res[0];
                                break;
                            case 'chooseICNS':
                                this.icnsPath = res[0];
                                break;
                            case 'chooseICO':
                                this.icoPath = res[0];
                                break;
                            default:
                                break;
                        }
                    }
                },

                onShowFile: function (event) {
                    event.stopPropagation();
                    var target = event.target;
                    var thePath = '';
                    switch (target.id) {
                        case 'showPNG':
                            thePath = this.pngPath;
                            break;
                        case 'showICNS':
                            thePath = this.icnsPath;
                            break;
                        case 'showICO':
                            thePath = this.icoPath;
                            break;
                        default:
                            break;
                    }

                    if (!thePath) {
                        return;
                    }

                    if (!Fs.existsSync(thePath)) {
                        Editor.warn('%s not exists!', thePath);
                        return;
                    }
                    Electron.shell.showItemInFolder(thePath);
                    Electron.shell.beep();
                },

                _onReplaceClick: function (event) {
                    event.stopPropagation();
                    Async.waterfall([
                        next => {
                            if (!this.ios) {
                                next();
                                return;
                            }
                            this._replaceIOS(err => {
                                if (err) {
                                    Editor.warn('Replace iOS icon failed!');
                                } else {
                                    Editor.log('Replace iOS icon succeed!');
                                }
                                next();
                            });
                        },
                        next => {
                            if (!this.android) {
                                next();
                                return;
                            }
                            this._replaceAndroid(err => {
                                if (err) {
                                    Editor.warn('Replace Android icon failed!');
                                } else {
                                    Editor.log('Replace Android icon succeed!');
                                }
                                next();
                            });
                        },
                        next => {
                            this.mac && this._replaceMac();
                            this.windows && this._replaceWindows();
                            next();
                        }
                    ], err => {
                        if (err) {
                            Editor.warn(`Error occurred: ${err.stack}`);
                        }
                    });
                },

                _replaceIOS: function (cb) {
                    this._trackEvent('iOS begin');

                    if (!this._checkFile(this.pngPath, '.png')) {
                        cb(new Error(`Check ${this.pngPath} failed!`));
                        this._trackEvent('iOS error1');
                        return;
                    }

                    var iconPath = Path.normalize(Path.join(this.projPath, IOSIconsDir));
                    if (!Fs.existsSync(iconPath) || !Fs.isDirSync(iconPath)) {
                        var msg = `${iconPath} is not a valid directory.`;
                        Editor.warn(msg);
                        cb(new Error(msg));
                        this._trackEvent('iOS error2');
                        return;
                    }
                    let ver = App.getVersion();
                    console.log('ver: ' + ver);
                    let newIconPath = Path.join(iconPath, IOSIconNamePattern);
                    if (!Fs.existsSync(newIconPath)) {// creator1.7之后构建的工程
                        let tmpPath = Path.join(iconPath, IOSIconAddDir);
                        newIconPath = Path.join(tmpPath, IOSIconNamePattern);
                        if (!Fs.existsSync(newIconPath)) {
                            let msg = `${newIconPath} is not a valid directory.`;
                            Editor.warn(msg);
                            cb(new Error(msg));
                            this._trackEvent('iOS error3');
                            return;
                        } else {
                            console.log("新版本的creator构建的ios项目,icon目录有变化!");
                        }
                    }
                    Globby(newIconPath, (err, paths) => {
                        Async.eachSeries(paths, (path, next) => {
                            this._resizePngToPath(this.pngPath, path, err => {
                                if (err) {
                                    Editor.warn(`Replace ${path} failed!`);
                                }
                                next();
                            });
                        }, err => {
                            cb(err);
                            if (!err) {
                                this._trackEvent('iOS success');
                            } else {
                                this._trackEvent('iOS error3');
                            }
                        });
                    });
                },

                _replaceAndroid: function (cb) {
                    this._trackEvent('Android begin');
                    if (!this._checkFile(this.pngPath, '.png')) {
                        cb(new Error(`Check ${this.pngPath} failed!`));
                        this._trackEvent('Android error1');
                        return;
                    }

                    Async.eachSeries(AndroidProjectInfo, (info, next) => {
                        var iconPath = Path.normalize(Path.join(this.projPath, info.resDir));
                        if (!Fs.existsSync(iconPath) || !Fs.isDirSync(iconPath)) {
                            var msg = `${iconPath} is not a valid directory.`;
                            Editor.warn(msg);
                            next();
                            return;
                        }

                        var pattern = Path.join(iconPath, info.iconFolderPattern, info.iconName);
                        Globby(pattern, (err, paths) => {
                            Async.eachSeries(paths, (path, done) => {
                                this._resizePngToPath(this.pngPath, path, err => {
                                    if (err) {
                                        Editor.warn(`Replace ${path} failed!`);
                                    }
                                    done();
                                });
                            }, err => {
                                next(err);
                            });
                        });
                    }, err => {
                        cb(err);
                        if (err) {
                            this._trackEvent('Android error2');
                        } else {
                            this._trackEvent('Android success');
                        }
                    });
                },

                _replaceMac: function () {
                    this._trackEvent('Mac begin');
                    var ret = this._replaceByCopy('.icns', this.icnsPath, MacIconPath);
                    if (!ret) {
                        Editor.warn('Replace Mac icon failed!');
                        this._trackEvent('Mac error');
                    } else {
                        Editor.log('Replace Mac icon succeed!');
                        this._trackEvent('Mac success');
                    }
                },

                _replaceWindows: function () {
                    this._trackEvent('Windows begin');
                    var ret = this._replaceByCopy('.ico', this.icoPath, WindowsIconPath);
                    if (!ret) {
                        Editor.warn('Replace Windows icon failed!');
                        this._trackEvent('Windows error');
                    } else {
                        Editor.log('Replace Windows icon succeed!');
                        this._trackEvent('Windows success');
                    }
                },

                _checkFile: function (filePath, ext) {
                    if (!filePath) {
                        Editor.warn(`Please specify a ${ext} file.`);
                        return false;
                    }

                    if (!Fs.existsSync(filePath)) {
                        Editor.warn(`${filePath} is not existed.`);
                        return false;
                    }

                    if (Path.extname(filePath) !== ext) {
                        Editor.warn(`${filePath} is not a ${ext} file.`);
                        return false;
                    }

                    return true;
                },

                _replaceByCopy: function (ext, srcPath, dstPath) {
                    if (!this._checkFile(srcPath, ext)) {
                        return false;
                    }

                    var targetFile = Path.normalize(Path.join(this.projPath, dstPath));
                    try {
                        Fs.copySync(srcPath, targetFile);
                    } catch (err) {
                        Editor.warn(`Copy file ${srcPath} to ${targetFile} failed. message: ${err.stack}`);
                        return false;
                    }

                    return true;
                },

                _resizePngToPath: function (srcPng, dstPng, cb) {
                    var dstSize = 0;
                    var sharpPath;
                    if (Editor.dev) {
                        sharpPath = 'sharp';
                    } else {
                        sharpPath = Editor.url('unpack://utils/sharp');
                    }
                    const Sharp = require(sharpPath);
                    Async.waterfall([
                        next => {
                            // get the size of dst png
                            Sharp(dstPng)
                                .metadata((err, data) => {
                                    if (err) {
                                        Editor.warn(`Get the image size of ${dstPng} failed!`);
                                        next(err);
                                        return;
                                    }

                                    if (data.width !== data.height) {
                                        Editor.warn(`The width(${data.width}) of ${dstPng} is not equal with the height(${data.height}).`);
                                    }
                                    dstSize = Math.max(data.width, data.height);
                                    next();
                                });
                        },
                        next => {
                            var img = Sharp(srcPng);
                            img.metadata((err, data) => {
                                if (err) {
                                    Editor.warn(`Get the image size of ${srcPng} failed!`);
                                    next(err);
                                    return;
                                }

                                if (data.width !== data.height) {
                                    Editor.warn(`The width(${data.width}) of ${srcPng} is not equal with the height(${data.height}).`);
                                }
                                var srcSize = Math.max(data.width, data.height);
                                if (srcSize < dstSize) {
                                    Editor.warn(`${srcPng} size(${srcSize}) is smaller than ${dstPng} size(${dstSize}).`);
                                }

                                img.resize(dstSize, dstSize)
                                    .toFormat(Sharp.format.png)
                                    .toFile(dstPng, (err, info) => {
                                        if (err) {
                                            Editor.warn(`Replace ${dstPng} failed. Message : ${err.stack}`);
                                        }
                                        next(err);
                                    });
                            });
                        }
                    ], err => {
                        cb(err);
                    });
                },

                _trackEvent: function (action) {
                    Editor.Ipc.sendToMain('metrics:track-event', {
                        category: 'Packages',
                        label: 'replace-icons',
                        action: action
                    });
                }
            }
        });

        this._createProjNames();
    },

    _createProjNames: function () {
        Editor.Profile.load('profile://local/builder.json', (err, profile) => {
            if (err) {
                Editor.error(`Get the build path failed. Please Build the project first.`);
                return;
            }

            var buildPath = profile.data.buildPath;
            if (!Path.isAbsolute(buildPath)) {
                buildPath = Path.join(Editor.projectInfo.path, buildPath);
            }
            buildPath = Path.normalize(buildPath);
            var ret = [];
            if (!Fs.existsSync(buildPath) || !Fs.isDirSync(buildPath)) {
                Editor.error(`Build Path ${buildPath} is invalid. Please Build the project first.`);
                return ret;
            }

            Fs.readdirSync(buildPath).forEach(function (file) {
                var curPath = Path.join(buildPath, file);
                if (Fs.isDirSync(curPath) && file.indexOf('jsb-') === 0) {
                    ret.push({
                        value: curPath,
                        text: file
                    })
                }
            });

            if (ret.length === 0) {
                Editor.error('There is not any native project path. Please Build the project first.');
            }

            this._vm.projNames = ret;
        });
    }
});
