"use strict";
window.packageRoot = 'packages://hot-update-tools/';

var fs = require('fire-fs');
var path = require('fire-path');
var Electron = require('electron');
var {remote} = require('electron');
var CfgUtil = Editor.require('packages://hot-update-tools/core/CfgUtil.js');
var FileUtil = Editor.require('packages://hot-update-tools/core/FileUtil.js');
var Mail = Editor.require('packages://hot-update-tools/mail/Mail.js');


Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://hot-update-tools/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://hot-update-tools/panel/index.html', 'utf8')) + "",
    $: {
        logTextArea: '#logTextArea',
        hotAddressSelect: '#hotAddressSelect',
        testEnvSelect: '#testEnvSelect',
    },
    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };


        let hotAddressSelectCtrl = this.$hotAddressSelect;
        window.hotAddressSelectCtrl = hotAddressSelectCtrl;

        function selectionLast(index) {
            setTimeout(function () {
                hotAddressSelectCtrl.selectedIndex = index;
            }, 10);
        }

        function getSelectIp() {
            let ip = hotAddressSelectCtrl.$select.value;
            console.log(ip);
            return ip;
        }


        // 初始化vue面板
        new window.Vue({
            el: this.shadowRoot,
            created: function () {
                this._initPluginCfg();
            },
            init: function () {
            },
            data: {
                srcDirPath: "",
                resDirPath: "",
                projManifestPath: "",
                verManifestPath: "",

                version: "",
                remoteServerVersion: "",// 远程服务器版本
                isShowRemoteServerVersion: false,// 是否显示远程服务器版本号
                genManifestDir: "",
                serverRootDir: "",
                resourceRootDir: "",
                localServerPath: "",
                logView: "",

                copyProgress: 0,
                totalNum: 0,// 操作文件总数
                curNum: 0,// 当前操作的次数

                serverVersion: "-",// 服务器版本
                serverPackageUrl: "",
                localGameVersion: "-",//游戏版本号
                localGamePackageUrl: "",
                localGameProjectManifest: "",
                localGameVersionManifest: "",
                localGameProjectManifestUrl: "",//assets的url
                localGameVersionManifestUrl: "",//

                // 测试环境逻辑变量
                testEnvLocal: true,
                testEnvALi: false,
                testEnvSelect: 0,

                // 热更资源服务器配置历史记录
                isShowUseAddrBtn: false,
                isShowDelAddrBtn: false,
                hotAddressArray: [
                    'http://www.baidu.com',
                    'http://192.168.0.2'
                ],
            },
            methods: {
                // 测试
                onTest() {
                    Mail.sendMail(this.version, "修复bug", null, function () {
                        console.log("send over");
                    });

                },

                onChangeSelectHotAddress(event) {
                    console.log("change");
                    this.isShowUseAddrBtn = this.isShowDelAddrBtn = true;
                },
                // 增加热更历史地址
                _addHotAddress(addr) {
                    let isAddIn = true;
                    for (let i = 0; i < this.hotAddressArray.length; i++) {
                        let item = this.hotAddressArray[i];
                        if (item === addr) {
                            isAddIn = false;
                            break;
                        }
                    }
                    if (isAddIn) {
                        this.hotAddressArray.push(addr);
                        this._addLog("[HotAddress]历史记录添加成功:" + addr);
                    } else {
                        this._addLog("[HotAddress]历史记录已经存在该地址: " + addr);
                    }
                },
                // 删除热更历史地址
                onBtnClickDelSelectedHotAddress() {
                    let address = window.hotAddressSelectCtrl.value;
                    if (this.hotAddressArray.length > 0) {
                        for (let i = 0; i < this.hotAddressArray.length;) {
                            let item = this.hotAddressArray[i];
                            if (item === address) {
                                this.hotAddressArray.splice(i, 1);
                                this._addLog("删除历史地址成功: " + item);
                            } else {
                                i++;
                            }
                        }
                    } else {
                        this._addLog("历史地址已经为空");
                    }
                },
                onBtnClickUseSelectedHotAddress() {
                    let address = window.hotAddressSelectCtrl.value;
                    this.serverRootDir = address;
                    this.onInPutUrlOver();
                },
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                _getFileIsExist(path) {
                    try {
                        fs.accessSync(path, fs.F_OK);
                    } catch (e) {
                        return false;
                    }
                    return true;
                },

                onCleanAPPCfg() {
                    CfgUtil.cleanConfig();
                },

                _saveConfig() {
                    let data = {
                        version: this.version,
                        serverRootDir: this.serverRootDir,
                        resourceRootDir: this.resourceRootDir,
                        genManifestDir: CfgUtil.getMainFestDir(),

                        localServerPath: this.localServerPath,
                        hotAddressArray: this.hotAddressArray,
                    };
                    CfgUtil.saveConfig(data);
                },
                _initPluginCfg() {
                    console.log("init cfg");
                    // manifest输出目录
                    this.genManifestDir = CfgUtil.getMainFestDir();
                    if (FileUtil.isFileExit(this.genManifestDir) === false) {
                        FileUtil.mkDir(this.genManifestDir);
                    }


                    // 用户自定义配置
                    CfgUtil.initCfg(function (data) {
                        if (data) {
                            this.version = data.version;
                            this.serverRootDir = data.serverRootDir;
                            this.resourceRootDir = data.resourceRootDir;
                            this.localServerPath = data.localServerPath;
                            this.hotAddressArray = data.hotAddressArray || [];
                            this._updateServerVersion();
                            this._getRemoteServerVersion();
                        } else {
                            this._saveConfig();
                        }
                        this._initResourceBuild();
                        this.initLocalGameVersion();
                    }.bind(this));

                },
                // 导入生成的manifest到游戏项目中
                importManifestToGame() {
                    let projectFile = path.join(this.genManifestDir, "project.manifest");
                    let versionFile = path.join(this.genManifestDir, "version.manifest")

                    let strArr = this.localGameProjectManifestUrl.split("project.manifest");
                    let dir = strArr[0];
                    Editor.assetdb.import([projectFile, versionFile], dir,
                        function (err, results) {
                            results.forEach(function (result) {
                                console.log(result.path);
                                // result.uuid
                                // result.parentUuid
                                // result.url
                                // result.path
                                // result.type
                            });
                        }.bind(this));
                    this.initLocalGameVersion();
                    // let JSZip = Editor.require("packages://hot-update-tools/node_modules/jszip");
                    // let zip = new JSZip();
                    // zip.file("Hello.txt", "Hello World\n");
                    //
                    // let img = zip.folder("images");
                    // img.file("smile.gif", imgData, {base64: true});
                    //
                    // zip.generateAsync({type:"blob"}).then(function(content) {
                    //     saveAs(content, "example.zip");
                    // });


                    // let spawn = require('child_process').spawn;
                    // let free = spawn('cmd', []);
                    // // 捕获标准输出并将其打印到控制台
                    // free.stdout.on('data', function (data) {
                    //     console.log('standard output:\n' + data);
                    // });
                    //
                    // // 捕获标准错误输出并将其打印到控制台
                    // free.stderr.on('data', function (data) {
                    //     console.log('standard error output:\n' + data);
                    // });
                    //
                    // // 注册子进程关闭事件
                    // free.on('exit', function (code, signal) {
                    //     console.log('child process eixt ,exit:' + code);
                    // });
                },
                initLocalGameVersion() {
                    Editor.assetdb.queryAssets('db://assets/**\/*', "raw-asset", function (err, results) {
                        let versionCfg = "";
                        let projectCfg = "";
                        results.forEach(function (result) {
                            if (result.path.indexOf("version.manifest") !== -1) {
                                versionCfg = result.path;
                                this.localGameVersionManifestUrl = result.url;
                            } else if (result.path.indexOf("project.manifest") !== -1) {
                                projectCfg = result.path;
                                this.localGameProjectManifestUrl = result.url;
                            }
                        }.bind(this));
                        console.log("version: " + versionCfg);
                        console.log("project: " + projectCfg);

                        if (versionCfg.length === 0) {
                            this._addLog("项目中没有配置文件: version.manifest");
                            return;
                        }
                        if (projectCfg.length === 0) {
                            this._addLog("项目中没有配置文件: project.manifest");
                            return;
                        }

                        this.localGameVersionManifest = versionCfg;
                        this.localGameProjectManifest = projectCfg;

                        let verVersion = "";
                        let projVersion = "";
                        fs.readFile(versionCfg, 'utf-8', function (err, data) {
                            if (!err) {
                                let verData = JSON.parse(data);
                                verVersion = verData.version;
                                fs.readFile(projectCfg, 'utf-8', function (err, data) {
                                    if (!err) {
                                        let projectData = JSON.parse(data);
                                        projVersion = projectData.version;
                                        if (projVersion === verVersion) {
                                            this.localGameVersion = projVersion;
                                            this.localGamePackageUrl = projectData.packageUrl;
                                        } else {
                                            this._addLog("游戏中的 project.manifest 和 version.manifest 中的version字段值不一致,请检查配置文件");
                                        }
                                    } else {
                                        // this.localGameVersion = "没有在项目中发现热更新文件";
                                        this._addLog("读取项目中的配置文件失败: " + projectCfg);
                                    }
                                }.bind(this))
                            } else {
                                this._addLog("读取项目中的配置文件失败: " + versionCfg);
                            }
                        }.bind(this))
                    }.bind(this));
                    /*
                    Editor.assetdb.deepQuery(function (err, results) {
                        results.forEach(function (result) {
                            if (result.type !== "folder" &&
                                result.type !== "texture" &&
                                result.type !== "sprite-frame" &&
                                result.type !== "javascript" &&
                                result.type !== "dragonbones-atlas" &&
                                result.type !== "prefab" &&
                                result.type !== "audio-clip" &&
                                result.type !== "animation-clip" &&
                                result.type !== "scene" &&
                                result.type !== "dragonbones" &&
                                result.type !== "particle" &&
                                result.type !== "label-atlas" &&
                                result.type !== "text" &&
                                result.type !== "" &&
                                result.type !== ""
                            ) {
                                let fullName = result.name + result.extname;
                                console.log(result.type + " : " + fullName);
                            }
                        });
                    });
                    */
                },
                // build目录
                _initResourceBuild() {
                    if (this.resourceRootDir.length === 0) {
                        // Editor.Profile.load('profile://local/builder.json', (err, profile) => {
                        //     if (!err) {
                        //         console.log(profile);
                        //     }
                        // });
                        // 没有填写resource目录,自动提示
                        let projectDir = path.join(Editor.assetdb.library, "../");
                        let buildCfg = path.join(projectDir, "local/builder.json");
                        if (FileUtil.isFileExit(buildCfg)) {
                            fs.readFile(buildCfg, 'utf-8', function (err, data) {
                                if (!err) {
                                    let buildData = JSON.parse(data);
                                    let buildDir = buildData.buildPath;
                                    let buildFullDir = path.join(projectDir, buildDir);
                                    let jsbDir = path.join(buildFullDir, "jsb-default");
                                    this._checkResourceRootDir(jsbDir);
                                }
                            }.bind(this))
                        } else {
                            this._addLog("发现没有构建项目, 使用前请先构建项目!");
                        }
                    }
                },
                _checkResourceRootDir(jsbDir) {
                    if (FileUtil.isFileExit(jsbDir)) {
                        let srcPath = path.join(jsbDir, "src");
                        let resPath = path.join(jsbDir, "res");
                        if (FileUtil.isFileExit(srcPath) === false) {
                            this._addLog("没有发现 " + srcPath + ", 请先构建项目.");
                            return false;
                        }
                        if (FileUtil.isFileExit(resPath) === false) {
                            this._addLog("没有发现 " + resPath + ", 请先构建项目.");
                            return false;
                        }
                        this.resourceRootDir = jsbDir;
                        return true;
                    } else {
                        this._addLog("没有发现 " + jsbDir + ", 请先构建项目.");
                        return false;
                    }
                },
                onClickGenCfg(event) {
                    if (!this.version || this.version.length <= 0) {
                        this._addLog("版本号未填写");
                        return;
                    }
                    if (!this.serverRootDir || this.serverRootDir.length <= 0) {
                        this._addLog("服务器地址未填写");
                        return;
                    }

                    // 检查resource目录
                    if (this.resourceRootDir.length === 0) {
                        this._addLog("请先指定 <build项目资源文件目录>");
                        return;
                    }
                    if (this._checkResourceRootDir(this.resourceRootDir) === false) {
                        return;
                    }

                    if (!this.genManifestDir || this.genManifestDir.length <= 0) {
                        this._addLog("manifest文件生成地址未填写");
                        return;
                    }

                    if (!fs.existsSync(this.genManifestDir)) {
                        this._addLog("目录不存在: " + this.genManifestDir);
                        return;
                    }
                    this._addLog("开始生成manifest配置文件....");

                    this._saveConfig();
                    this._genVersion(this.version, this.serverRootDir, this.resourceRootDir, this.genManifestDir);
                },
                // serverUrl 必须以/结尾
                // genManifestDir 建议在assets目录下
                // buildResourceDir 默认为 build/jsb-default/
                // -v 10.1.1 -u http://192.168.191.1//cocos/remote-assets/  -s build/jsb-default/ -d assets
                _genVersion(version, serverUrl, buildResourceDir, genManifestDir) {
                    let projectFile = "project.manifest";
                    let versionFile = "version.manifest";
                    let manifest = {
                        version: version,
                        packageUrl: serverUrl,
                        remoteManifestUrl: "",
                        remoteVersionUrl: "",
                        assets: {},
                        searchPaths: []
                    };

                    if (serverUrl[serverUrl.length - 1] === "/") {
                        manifest.remoteManifestUrl = serverUrl + projectFile;
                        manifest.remoteVersionUrl = serverUrl + versionFile;
                    } else {
                        manifest.remoteManifestUrl = serverUrl + "/" + projectFile;
                        manifest.remoteVersionUrl = serverUrl + "/" + versionFile;
                    }
                    let dest = genManifestDir;
                    let src = buildResourceDir;

                    let readDir = function (dir, obj) {
                        let stat = fs.statSync(dir);
                        if (!stat.isDirectory()) {
                            return;
                        }
                        let subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
                        for (let i = 0; i < subpaths.length; ++i) {
                            if (subpaths[i][0] === '.') {
                                continue;
                            }
                            subpath = path.join(dir, subpaths[i]);
                            stat = fs.statSync(subpath);
                            if (stat.isDirectory()) {
                                readDir(subpath, obj);
                            }
                            else if (stat.isFile()) {
                                // Size in Bytes
                                size = stat['size'];
                                // let crypto = require('crypto');
                                md5 = require('crypto').createHash('md5').update(fs.readFileSync(subpath, 'binary')).digest('hex');
                                compressed = path.extname(subpath).toLowerCase() === '.zip';

                                relative = path.relative(src, subpath);
                                relative = relative.replace(/\\/g, '/');
                                relative = encodeURI(relative);
                                obj[relative] = {
                                    'size': size,
                                    'md5': md5
                                };
                                if (compressed) {
                                    obj[relative].compressed = true;
                                }
                            }
                        }
                    };

                    let mkdirSync = function (path) {
                        try {
                            fs.mkdirSync(path);
                        } catch (e) {
                            if (e.code !== 'EEXIST') throw e;
                        }
                    };

                    // Iterate res and src folder
                    readDir(path.join(src, 'src'), manifest.assets);
                    readDir(path.join(src, 'res'), manifest.assets);

                    let destManifest = path.join(dest, 'project.manifest');
                    let destVersion = path.join(dest, 'version.manifest');


                    mkdirSync(dest);

                    // 生成project.manifest
                    fs.writeFile(destManifest, JSON.stringify(manifest), function (err) {
                        if (err) throw err;
                        this._addLog("生成 project.manifest成功");
                    }.bind(this));

                    // 生成version.manifest
                    delete manifest.assets;
                    delete manifest.searchPaths;
                    fs.writeFile(destVersion, JSON.stringify(manifest), function (err) {
                        if (err) throw err;
                        this._addLog("生成 version.manifest成功");
                    }.bind(this));
                },
                // 选择物理server路径
                onSelectLocalServerPath(event) {
                    let res = Editor.Dialog.openFile({
                        title: "选择本地测试服务器目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        this.localServerPath = res[0];
                        this._saveConfig();
                        this._updateServerVersion();
                    }
                },
                // 拷贝文件到测试服务器
                onCopyFileToLocalServer() {
                    // 检查要拷贝的目录情况
                    if (!fs.existsSync(this.localServerPath)) {
                        this._addLog("本地测试服务器目录不存在:" + this.localServerPath);
                        return;
                    }

                    // 检查资源目录
                    let srcPath = path.join(this.resourceRootDir, "src");
                    let resPath = path.join(this.resourceRootDir, "res");
                    if (!fs.existsSync(this.resourceRootDir)) {
                        this._addLog("资源目录不存在: " + this.resourceRootDir + ", 请先构建项目");
                        return;
                    } else {
                        if (!fs.existsSync(srcPath)) {
                            this._addLog(this.resourceRootDir + "不存在src目录, 无法拷贝文件");
                            return;
                        }
                        if (!fs.existsSync(resPath)) {
                            this._addLog(this.resourceRootDir + "不存在res目录, 无法拷贝文件");
                            return;
                        }
                    }

                    // 检查manifest文件
                    let project = path.join(this.genManifestDir, "project.manifest");
                    let version = path.join(this.genManifestDir, "version.manifest");
                    if (!this.genManifestDir || this.genManifestDir.length <= 0) {
                        this._addLog("manifest文件生成地址未填写");
                        return;
                    } else {
                        if (!this._getFileIsExist(project)) {
                            this._addLog(project + "不存在, 请点击生成配置");
                            return;
                        }
                        if (!this._getFileIsExist(version)) {
                            this._addLog(version + "不存在, 请点击生成配置");
                            return;
                        }
                    }
                    this._addLog("开始拷贝文件到:" + this.localServerPath);
                    this.curNum = 0;
                    this.copyProgress = 0;
                    this.totalNum = this._getTotalNum();
                    this._addLog("操作文件总数据: " + this.totalNum);

                    this._delDir(this.localServerPath);
                    this._copySourceDirToDesDir(srcPath, path.join(this.localServerPath, "src"));
                    this._copySourceDirToDesDir(resPath, path.join(this.localServerPath, "res"));
                    this._copyFileToDesDir(project, this.localServerPath);
                    this._copyFileToDesDir(version, this.localServerPath);
                },

                // 获取要操作的文件总数量
                _getTotalNum() {
                    let delNum = this._getFileNum(this.localServerPath);
                    let srcNum = this._getFileNum(path.join(this.resourceRootDir, "src"));
                    let resNum = this._getFileNum(path.join(this.resourceRootDir, "res"));
                    return delNum + srcNum + resNum + 2 + 2;// 2个manifest,2个目录(src, res)
                },
                addProgress() {
                    this.curNum++;
                    let p = this.curNum / this.totalNum;
                    p = p ? p : 0;
                    console.log("进度: " + p * 100);
                    this.copyProgress = p * 100;
                    if (p >= 1) {
                        this._addLog("拷贝完成");
                        console.log("copy over");
                        this._updateServerVersion();
                    }
                },
                // 刷新服务器版本号
                refreshLocalServerVersion() {
                    this._updateServerVersion();
                },
                _updateServerVersion() {
                    if (this.localServerPath.length > 0) {
                        let path = require("fire-path");
                        let fs = require("fire-fs");
                        let versionCfg = path.join(this.localServerPath, "version.manifest");
                        fs.readFile(versionCfg, 'utf-8', function (err, data) {
                            if (!err) {
                                let cfg = JSON.parse(data);
                                this.serverVersion = cfg.version;
                                this.serverPackageUrl = cfg.packageUrl;
                            } else {
                                let projectCfg = path.join(this.localServerPath, "project.manifest");
                                fs.readFile(projectCfg, 'utf-8', function (err, data) {
                                    if (!err) {
                                        let projectCfg = JSON.parse(data);
                                        this.serverVersion = projectCfg.version;
                                        this.serverPackageUrl = projectCfg.packageUrl;
                                    } else {
                                        this._addLog("无法获取到本地测试服务器版本号");
                                    }
                                }.bind(this));
                            }
                        }.bind(this));
                    } else {
                        this._addLog("请选择本机server物理路径");
                    }
                },
                // 获取文件个数
                _getFileNum(url) {
                    let i = 0;
                    let lookDir = function (fileUrl) {
                        let files = fs.readdirSync(fileUrl);//读取该文件夹
                        for (let k in files) {
                            i++;
                            let filePath = path.join(fileUrl, files[k]);
                            let stats = fs.statSync(filePath);
                            if (stats.isDirectory()) {
                                lookDir(filePath);
                            }
                        }
                    };
                    lookDir(url);
                    return i;
                },
                _delDir(rootFile) {
                    let self = this;
                    //删除所有的文件(将所有文件夹置空)
                    let emptyDir = function (fileUrl) {
                        let files = fs.readdirSync(fileUrl);//读取该文件夹
                        for (let k in files) {
                            let filePath = path.join(fileUrl, files[k]);
                            let stats = fs.statSync(filePath);
                            if (stats.isDirectory()) {
                                emptyDir(filePath);
                            } else {
                                fs.unlinkSync(filePath);
                                self.addProgress();
                                // console.log("删除文件:" + filePath);
                            }
                        }
                    };
                    //删除所有的空文件夹
                    let rmEmptyDir = function (fileUrl) {
                        let files = fs.readdirSync(fileUrl);
                        if (files.length > 0) {
                            for (let k in files) {
                                let rmDir = path.join(fileUrl, files[k]);
                                rmEmptyDir(rmDir);
                            }
                            if (fileUrl !== rootFile) {// 不删除根目录
                                fs.rmdirSync(fileUrl);
                                self.addProgress();
                                // console.log('删除空文件夹' + fileUrl);
                            }
                        } else {
                            if (fileUrl !== rootFile) {// 不删除根目录
                                fs.rmdirSync(fileUrl);
                                self.addProgress();
                                // console.log('删除空文件夹' + fileUrl);
                            }
                        }
                    };
                    emptyDir(rootFile);
                    rmEmptyDir(rootFile);
                },
                // 拷贝文件到目录
                _copyFileToDesDir(file, desDir) {
                    if (this._getFileIsExist(file)) {
                        let readable = fs.createReadStream(file);// 创建读取流
                        let copyFileName = path.basename(file);
                        let fileName = path.join(desDir, copyFileName);
                        let writable = fs.createWriteStream(fileName);// 创建写入流
                        readable.pipe(writable);// 通过管道来传输流
                        this.addProgress();
                    }
                },
                // 拷贝文件夹
                _copySourceDirToDesDir(source, des) {
                    let self = this;
                    // 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
                    let exists = function (src, dst, callback) {
                        fs.exists(dst, function (exists) {
                            // 已存在
                            if (exists) {
                                callback(src, dst);
                            }
                            // 不存在
                            else {
                                fs.mkdir(dst, function () {
                                    self.addProgress();
                                    callback(src, dst);
                                });
                            }
                        });
                    };
                    /*
                     * 复制目录中的所有文件包括子目录
                     * @param{ String } 需要复制的目录
                     * @param{ String } 复制到指定的目录
                     */
                    let copy = function (src, dst) {
                        // 读取目录中的所有文件/目录
                        fs.readdir(src, function (err, paths) {
                            if (err) {
                                throw err;
                            }
                            paths.forEach(function (path) {
                                let _src = src + '/' + path,
                                    _dst = dst + '/' + path,
                                    readable, writable;
                                fs.stat(_src, function (err, st) {
                                    if (err) {
                                        throw err;
                                    }
                                    if (st.isFile()) {// 判断是否为文件
                                        readable = fs.createReadStream(_src);// 创建读取流
                                        writable = fs.createWriteStream(_dst);// 创建写入流
                                        readable.pipe(writable);// 通过管道来传输流
                                        // console.log("拷贝文件:" + _dst);
                                        self.addProgress();
                                    } else if (st.isDirectory()) {// 如果是目录则递归调用自身
                                        exists(_src, _dst, copy);
                                    }
                                });
                            });
                        });
                    };
                    // 复制目录
                    exists(source, des, copy);
                },
                onInputVersionOver() {
                    this._saveConfig();
                },
                onInPutUrlOver(event) {
                    let url = this.serverRootDir;
                    let index1 = url.indexOf("http://");
                    let index2 = url.indexOf("https://");
                    if (index1 === -1 && index2 === -1) {
                        let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
                        if (!reg.test(url)) {
                            this._addLog(url + " 不是以http://https://开头，或者不是网址, 已经自动修改");
                            this.serverRootDir = "http://" + this.serverRootDir;
                            this._getRemoteServerVersion();
                        }
                    } else {
                        // 更新服务器版本
                        this._getRemoteServerVersion();
                    }
                    this._addHotAddress(this.serverRootDir);
                    this._saveConfig();
                },
                // 获取远程资源服务器的版本号
                _getRemoteServerVersion() {
                    // TODO 浏览器缓存会导致版本号获取失败
                    this.isShowRemoteServerVersion = false;
                    let versionUrl = this.serverRootDir + "/version.manifest";

                    let xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && ((xhr.status >= 200 && xhr.status < 400))) {
                            let text = xhr.responseText;
                            // console.log("版本文件内容\n" + versionUrl + "\n" + text);
                            let json = null;
                            try {
                                json = JSON.parse(text);
                            } catch (e) {
                                console.log(e);
                                this._addLog("获取远程版本号失败!");
                                return;
                            }
                            this.isShowRemoteServerVersion = true;
                            this.remoteServerVersion = json.version;
                        } else if (xhr.status === 404) {
                            // console.log("404");
                        }
                    }.bind(this);
                    xhr.open('get', versionUrl, true);
                    xhr.setRequestHeader("If-Modified-Since", "0");// 不缓存
                    xhr.send();
                },
                onTestUrl() {
                    let url = this.serverRootDir;
                    if (url.length > 0) {
                        this._isUrlAvilable(url, function (code) {
                            this._addLog(url + " 响应: " + code);
                        }.bind(this));
                    } else {
                        this._addLog("请填写 [资源服务器url] ");
                    }
                },
                _isUrlAvilable(url, callback) {
                    let http = require("http");
                    try {
                        http.get(url, function (res) {
                            if (callback) {
                                callback(res.statusCode);
                            }
                            //let text;
                            //res.setEncoding('utf8');
                            //res.on('data', function (chunk) {
                            //    text += chunk;
                            //    console.log(text);
                            //});
                        }.bind(this));
                    } catch (e) {
                        callback(-1);
                    }
                },
                // 访问测试网站
                onOpenUrl(event) {
                    let url = this.serverRootDir;
                    if (url.length > 0) {
                        Electron.shell.openExternal(url);
                    } else {
                        this._addLog("未填写参数");
                    }
                },
                userLocalIP() {
                    let ip = "";
                    let os = require('os');
                    let network = os.networkInterfaces();
                    for (let i = 0; i < network.WLAN.length; i++) {
                        let json = network.WLAN[i];
                        if (json.family === 'IPv4') {
                            ip = json.address;
                        }
                    }
                    console.log(ip);
                    if (ip.length > 0) {
                        this.serverRootDir = "http://" + ip;
                        this.onInPutUrlOver(null);
                    }
                },
                // 选择资源文件目录
                onSelectSrcDir(event) {
                    let res = Editor.Dialog.openFile({
                        title: "选择Src目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                        callback: function (fileNames) {

                        },
                    });
                    if (res !== -1) {
                        this.srcDirPath = res[0];
                        this._saveConfig();
                    }
                },
                onSelectResDir() {
                    let res = Editor.Dialog.openFile({
                        title: "选择Res目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        this.resDirPath = res[0];
                        this._saveConfig();
                    }
                },
                // 选择projManifest文件
                onOpenResourceDir() {
                    if (!fs.existsSync(this.resourceRootDir)) {
                        this._addLog("目录不存在：" + this.resourceRootDir);
                        return;
                    }
                    Electron.shell.showItemInFolder(this.resourceRootDir);
                    Electron.shell.beep();
                },
                onOpenManifestDir() {
                    if (!fs.existsSync(this.genManifestDir)) {
                        this._addLog("目录不存在：" + this.genManifestDir);
                        return;
                    }
                    Electron.shell.showItemInFolder(this.genManifestDir);
                    Electron.shell.beep();
                },
                onOpenLocalServer() {
                    if (!fs.existsSync(this.genManifestDir)) {
                        this._addLog("目录不存在：" + this.localServerPath);
                        return;
                    }
                    Electron.shell.showItemInFolder(this.localServerPath);
                    Electron.shell.beep();
                },
                // 选择生成Manifest的目录
                onSelectGenManifestDir() {
                    let res = Editor.Dialog.openFile({
                        title: "选择生成Manifest目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        this.genManifestDir = res[0];
                        this._saveConfig();
                    }
                },
                onSelectGenServerRootDir() {
                    let res = Editor.Dialog.openFile({
                        title: "选择部署的服务器根目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        this.serverRootDir = res[0];
                        this._saveConfig();
                    }
                },
                onSelectResourceRootDir() {
                    let res = Editor.Dialog.openFile({
                        title: "选择构建后的根目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        if (this._checkResourceRootDir(dir)) {
                            this.resourceRootDir = dir;
                            this._saveConfig();
                        }
                    }
                },
                onCleanSimRemoteRes() {
                    let path = require("fire-path");
                    let simPath = path.join(__dirname, "../cocos2d-x/simulator/win32");
                    let remoteAsset = path.join(simPath, "remote-asset");
                    if (!fs.existsSync(remoteAsset)) {
                        console.log(remoteAsset);
                        this._addLog("目录不存在: " + remoteAsset);
                    } else {
                        FileUtil.emptyDir(remoteAsset);
                        this._addLog("清空目录 " + remoteAsset + " 成功.");
                    }
                },
                onOpenLocalGameManifestDir() {
                    let strArr = this.localGameProjectManifest.split("project.manifest");
                    let dir = strArr[0];

                    if (!fs.existsSync(dir)) {
                        this._addLog("目录不存在：" + dir);
                        return;
                    }
                    Electron.shell.showItemInFolder(dir);
                    Electron.shell.beep();
                },
                onTestZip() {
                    let zip = require("node-native-zip");
                },
                //
                onTestSelect() {
                    let ip = Math.random() * 100;
                    this.hotAddressArray.push(ip.toFixed(2));
                    selectionLast(this.hotAddressArray.length - 1);
                },
                onIpSelectChange(event) {
                    console.log("index:%d, text:%s, value:%s ", event.detail.index, event.detail.text, event.detail.value);
                },
                onLogIp() {
                    // getSelectIp();
                    Editor.Ipc.sendToMain('hot-update-tools:test', 'Hello, this is simple panel');
                    // let relativePath = path.relative(__dirname, path.join(Editor.projectInfo.path, 'assets'));
                    // console.log(relativePath);
                },
                onTestEnvChange(event) {
                    // let children = event.target.$select.children;
                    // for (let i = 0; i < children.length; i++) {
                    //     let item = children[i];
                    //     if (item.value === "0") {
                    //         item.selected = true;
                    //     } else {
                    //         item.selected = false;
                    //     }
                    // }
                    let selectValue = event.target.value;
                    this.testEnvALi = false;
                    this.testEnvLocal = false;
                    if (selectValue === "0") {// 本地测试环境
                        this.testEnvLocal = true;
                    } else if (selectValue === "1") {//阿里云测试环境
                        this.testEnvALi = true;

                    }
                },
            }
        });
    },
});