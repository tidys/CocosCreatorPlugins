var FS = require("fire-fs");
var PATH = require('fire-path');
var CfgUtil = Editor.require("packages://plugin-bugly/core/CfgUtil");
var fse = require('fs-extra');
var rimraf = require('rimraf');
var Electron = require('electron');

Editor.Panel.extend({
    style: FS.readFileSync(Editor.url('packages://plugin-bugly/panel/index.html', 'utf8')) + "",
    template: FS.readFileSync(Editor.url('packages://plugin-bugly/panel/index.html', 'utf8')) + "",

    $: {
        logTextArea: '#logTextArea',
        uploadBtn: '#uploadBtn',
    },

    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };
        let uploadBtn = this.$uploadBtn;
        let setUploadBtnDisabled = function (b) {
            uploadBtn.disabled = b;
        };


        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
                this.initPlugin();
            },
            data: {
                preGameID: "",
                gameID: "",
                gameKey: "",
                gamePackage: "com.game.test",
                gameVersion: "1.0",
                channal: "",
                logView: [],
                isShowFreshAppPackage: true,
                isShowOutPutFileFilePath: false,
                outPutFilePath: "",// 符号保存位置
                isAutoUpload: true,
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                _addLogNoTime(data) {
                    this.logView += data;
                    logListScrollToBottom();
                },
                initPlugin() {
                    CfgUtil.initCfg(function (data) {
                        if (data) {
                            // console.log(data);
                            this.gameID = data.gameID;
                            this.gameKey = data.gameKey;
                            this.gameVersion = data.gameVersion;
                            this.channal = data.channal;
                            this.isAutoUpload = data.isAutoUpload;
                        }
                    }.bind(this));
                    // 包名
                    this.updateGamePackageName();
                },
                // 更新游戏包名
                updateGamePackageName() {
                    let projectPath = Editor.projectInfo.path;
                    let buildCfg = PATH.join(projectPath, "settings/builder.json");
                    if (!FS.existsSync(buildCfg)) {
                        this.gamePackage = null;
                    } else {
                        function setGamePackage() {
                            let data = FS.readFileSync(buildCfg, 'utf-8');
                            let buildData = null;
                            try {
                                buildData = JSON.parse(data);
                            } catch (e) {
                                console.log(e);
                                buildData = null;
                            }
                            if (buildData) {
                                if (buildData.packageName) {
                                    this.gamePackage = buildData.packageName;
                                } else {
                                    this.gamePackage = null;
                                }
                            }
                        }

                        FS.unwatchFile(buildCfg);
                        this.isShowFreshAppPackage = false;
                        FS.watch(buildCfg, function (event, fileName) {
                            console.log("event:%s, file:%s ", event, fileName);
                            setGamePackage.apply(this);
                        }.bind(this));
                        setGamePackage.apply(this);
                    }
                },
                onLogViewMenu(event) {
                    console.log("onLogViewMenu");
                    Editor.Ipc.sendToMain('plugin-bugly:popup-create-menu', event.x, event.y, null);
                },
                onChangeGameID() {
                    let oldGameID = CfgUtil.getGameID();
                    CfgUtil.setGameID(this.gameID);
                    if (oldGameID === this.gameID) {
                        return;
                    }

                    // 替换code值
                    let projectPath = Editor.projectInfo.path;
                    let buildCfg = PATH.join(projectPath, "local/builder.json");
                    if (!FS.existsSync(buildCfg)) {
                        this._addLog("发现没有构建项目, 使用前请先构建项目!");
                        return;
                    }


                    let data = FS.readFileSync(buildCfg, 'utf-8');
                    let buildData = JSON.parse(data);
                    let buildFullDir = PATH.join(projectPath, buildData.buildPath);
                    let AppDelegateCppFilePath = PATH.join(buildFullDir,
                        "jsb-" + buildData.template + "/frameworks/runtime-src/Classes/AppDelegate.cpp");

                    if (FS.existsSync(AppDelegateCppFilePath)) {
                        let fileData = FS.readFileSync(AppDelegateCppFilePath, 'utf-8');
                        let gameIDFlag = "CrashReport::initCrashReport(\"" + oldGameID + "\", false);";
                        let newGameIDString = "CrashReport::initCrashReport(\"" + this.gameID + "\", false);";
                        if (fileData.indexOf(gameIDFlag) >= 0) {
                            fileData = fileData.replace(gameIDFlag, newGameIDString);
                            FS.writeFileSync(AppDelegateCppFilePath, fileData);
                            this._addLog("文件成功更新GameID: " + AppDelegateCppFilePath);
                        } else {
                            this._addLog("AppID更新失败, 请先添加Bugly");
                        }
                    }
                },
                onAutoUpload() {
                    this.isAutoUpload = !this.isAutoUpload;
                    CfgUtil.setIsAutoUpload(this.isAutoUpload);
                },
                onSaveCfg() {
                    CfgUtil.setGameKeyAndVersion(this.gameKey, this.gameVersion, this.channal);
                },
                //打开符号表文件
                onOpenBuglySymbol() {
                    if (!FS.existsSync(this.outPutFilePath)) {
                        return;
                    }
                    Electron.shell.showItemInFolder(this.outPutFilePath);
                    Electron.shell.beep();
                },
                // 上传符号表文件
                onUploadBuglySymbol() {
                    console.log("onUploadBuglySymbol");

                    if (!(this.gameID && this.gameID.length > 0)) {
                        this._addLog("请填写AppId");
                        return;
                    }

                    if (!(this.gameKey && this.gameKey.length > 0)) {
                        this._addLog("请填写App Key");
                        return;
                    }
                    if (!(this.gamePackage && this.gamePackage.length > 0)) {
                        this._addLog("未发现包名, 请先构建安卓项目");
                        return;
                    }

                    if (!(this.gameVersion && this.gameVersion.length > 0)) {
                        this._addLog("请填写版本号");
                        return;
                    }
                    if (!(this.channal && this.channal.length > 0)) {
                        this._addLog("请填写channal");
                        return;
                    }


                    let projectPath = Editor.projectInfo.path;

                    // 检测so文件
                    let buildCfg = PATH.join(projectPath, "local/builder.json");
                    if (!FS.existsSync(buildCfg)) {
                        this._addLog("发现没有构建项目, 使用前请先构建项目!");
                        return;
                    }
                    let data = FS.readFileSync(buildCfg, 'utf-8');
                    let buildData = JSON.parse(data);
                    let buildFullDir = PATH.join(projectPath, buildData.buildPath);
                    let androidProjectRoot = PATH.join(buildFullDir,
                        "jsb-" + buildData.template + "/frameworks/runtime-src/proj.android-studio/");
                    let soPath0 = PATH.join(androidProjectRoot, "app/libs/armeabi-v7a/libcocos2djs.so");//creator 1.7之前的版本so文件会默认放在这个地方
                    let soPath1 = PATH.join(androidProjectRoot, "app/build/intermediates/ndkBuild/release/obj/local/armeabi-v7a/libcocos2djs.so");//手机上这种多,也是cocos默认的
                    let soPath2 = PATH.join(androidProjectRoot, "app/build/intermediates/ndkBuild/release/obj/local/armeabi/libcocos2djs.so");
                    let soPath3 = PATH.join(androidProjectRoot, "app/build/intermediates/ndkBuild/release/obj/local/x86/libcocos2djs.so");// 模拟器上这种
                    let soPath4 = PATH.join(androidProjectRoot, "app/build/intermediates/ndkBuild/release/obj/local/arm64-v8a/libcocos2djs.so");

                    let soPath = null;
                    if (FS.existsSync(soPath0)) {
                        soPath = soPath0;
                    } else if (FS.existsSync(soPath1)) {
                        soPath = soPath1;
                    } else if (FS.existsSync(soPath2)) {
                        soPath = soPath2;
                    } else if (FS.existsSync(soPath3)) {
                        soPath = soPath3;
                    } else if (FS.existsSync(soPath4)) {
                        soPath = soPath4;
                    } else {
                        this._addLog("请编译项目, 安卓项目没有发现so文件");
                        return;
                    }
                    if (soPath) {
                        this._addLog("so文件路径: " + soPath);
                    } else {
                        this._addLog("请编译项目, 安卓项目没有发现so文件");
                        return;
                    }

                    // 符号文件保存地址
                    const {remote} = require('electron');
                    let outPutDirPath = PATH.join(remote.app.getPath('userData'), "buglySymbolAndroid");
                    if (!FS.existsSync(outPutDirPath)) {
                        FS.mkdirSync(outPutDirPath);
                    }
                    let outPutFilePath = PATH.join(outPutDirPath, "buglySymbol.zip");
                    if (FS.existsSync(outPutFilePath)) {
                        FS.unlinkSync(outPutFilePath);
                    }
                    this.outPutFilePath = "";
                    this.isShowOutPutFileFilePath = false;

                    let jarPath = PATH.join(projectPath, "packages/plugin-bugly/buglySymbolAndroid/buglySymbolAndroid.jar");
                    if (FS.existsSync(jarPath)) {
                        setUploadBtnDisabled(true);

                        let buglyCmd =
                            "java -Xms512m -Xmx1024m -Dfile.encoding=UTF8 " +
                            " -jar " + jarPath +
                            " -i " + soPath +
                            " -o " + "\"" + outPutFilePath + "\"" +
                            " -id " + this.gameID +
                            " -key " + this.gameKey +
                            " -package " + this.gamePackage +
                            " -version " + this.gameVersion +
                            " -channel " + this.channal;

                        if (this.isAutoUpload) {
                            buglyCmd += " -u ";
                        }
                        this._addLog("\n[Jar Cmd] " + buglyCmd + "\n");
                        // console.log(buglyCmd);
                        let callFile = require('child_process');
                        let ret = callFile.exec(buglyCmd, function (err, stdOut) {
                            if (err) {
                                this._addLog("[生成失败:] " + err);
                                setUploadBtnDisabled(false);
                            } else {
                                // this._addLog(stdOut);
                            }
                        }.bind(this));

                        ret.stdout.on('data', function (data) {
                            this._addLogNoTime(data);


                            if (data.indexOf("Successfully zipped symtab file!") >= 0) {
                                this._addLog("生成成功!");
                                this.outPutFilePath = outPutFilePath;
                                this.isShowOutPutFileFilePath = true;
                                if (this.isAutoUpload) {
                                    this._addLog("开始上传!");
                                } else {
                                    setUploadBtnDisabled(false);
                                }
                            }

                            if (data.indexOf('Failed to upload symtab file') >= 0) {
                                this._addLog("上传失败!");
                                setUploadBtnDisabled(false);
                                this.outPutFilePath = outPutFilePath;
                                this.isShowOutPutFileFilePath = true;
                            }
                            if (data.indexOf('Successfully uploaded') >= 0) {
                                this._addLog("上传成功!");
                                setUploadBtnDisabled(false);
                                this.outPutFilePath = outPutFilePath;
                                this.isShowOutPutFileFilePath = true;
                            }
                        }.bind(this));
                    }

                },
                _checkIsBuildProject() {
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
                    }
                },
                queryBuildOptions(a) {
                    this.updateGamePackageName();
                },
                onAddBuglySdk() {
                    if (!(this.gameID && this.gameID.length > 0)) {
                        this._addLog("请填写App Id");
                        return;
                    }

                    let projectPath = Editor.projectInfo.path;
                    let buildCfg = PATH.join(projectPath, "local/builder.json");
                    if (!FS.existsSync(buildCfg)) {
                        this._addLog("发现没有构建项目, 使用前请先构建项目!");
                        return;
                    }


                    let data = FS.readFileSync(buildCfg, 'utf-8');
                    let buildData = JSON.parse(data);
                    let buildFullDir = PATH.join(projectPath, buildData.buildPath);


                    let version = '1.4.3';
                    let buglyResPath = PATH.join(projectPath, 'packages/plugin-bugly/bugly/' + version);


                    // 1.拷贝jar包
                    /* 将
                        CocosPlugin\agent\Android\bugly_agent.jar
                        BuglySDK\Android\bugly_crash_release.jar
                       拷贝到
                        Android工程的frameworks\runtime-src\proj.android-studio\app\libs\
                    */

                    function step1() {
                        window.plugin._addLog("copy jar ..");
                        // 拷贝的源目录
                        let agentJar = PATH.join(buglyResPath, "libs/bugly_agent.jar");
                        let crashJar = PATH.join(buglyResPath, "libs/bugly_crash_release.jar");
                        let jarPath = PATH.join(buglyResPath, "libs");
                        if (!FS.existsSync(jarPath)) {
                            window.plugin._addLog("没有发现插件bugly的jar文件");
                            return;
                        }

                        // 拷贝的目标目录
                        let projAndroidStudio = PATH.join(buildFullDir, "jsb-" + buildData.template + "/frameworks/runtime-src/proj.android-studio/");

                        if (!FS.existsSync(projAndroidStudio)) {
                            window.plugin._addLog("请构建项目,项目目录不存在:" + projAndroidStudio);
                            return;
                        }

                        let desJarDir = PATH.join(projAndroidStudio, "app/libs/");
                        if (!FS.existsSync(desJarDir)) {
                            FS.mkdirSync(desJarDir);
                            let str = "未发现目录: " + desJarDir + ",已经自动生成!";
                            window.plugin._addLog(str);
                        }

                        // 修改安卓工程jar包依赖
                        let dependenciesFile = PATH.join(projAndroidStudio, 'app/build.gradle');
                        if (!FS.existsSync(dependenciesFile)) {
                            window.plugin._addLog("项目文件: " + dependenciesFile + " 不存在,无法构建jar包依赖");
                            return;
                        }

                        let data = FS.readFileSync(dependenciesFile, 'utf-8');

                        let jarDependenciesFlag = "compile project(':libcocos2dx')\n" +
                            "    compile files('libs/bugly_agent.jar')\n" +
                            "    compile files('libs/bugly_crash_release.jar')";
                        if (data.indexOf(jarDependenciesFlag) === -1) {
                            data = data.replace("compile project(':libcocos2dx')", jarDependenciesFlag);
                            window.plugin._addLog("[build.gradle] 增加jar依赖");
                        } else {
                            window.plugin._addLog("[build.gradle] 已经增加jar依赖");
                        }
                        FS.writeFileSync(dependenciesFile, data);

                        fse.copy(jarPath, desJarDir, function (err) {
                            if (err) {
                                window.plugin._addLog("copy jar failed!");
                                console.log(err);
                            } else {
                                window.plugin._addLog("copy jar success!");
                                step2();
                            }
                        });
                    };


                    // 2.拷贝so库
                    /* 将
                        BuglySDK\Android\libs\armeabi-v7a文件夹
                       拷贝到
                        jsb-default\frameworks\runtime-src\proj.android-studio\app\jni\prebuilt，
                    *  如果prebuilt文件夹不存在就创建一下，如果还需要其他ABI就拷贝相应的，比如常用于模拟器的x86。
                    * */

                    function step2() {
                        window.plugin._addLog("copy so ..");
                        let prebuilt = PATH.join(buildFullDir,
                            "jsb-" + buildData.template +
                            "/frameworks/runtime-src/proj.android-studio/app/jni/prebuilt");

                        if (!FS.existsSync(prebuilt)) {
                            FS.mkdirSync(prebuilt);
                            window.plugin._addLog("创建 prebuilt 文件夹");
                        }

                        let prebuiltPath = PATH.join(buglyResPath, "prebuilt");
                        if (!FS.existsSync(prebuiltPath)) {
                            window.plugin._addLog("没有发现插件的prebuilt文件");
                            return;
                        }
                        fse.copy(prebuiltPath, prebuilt, function (err) {
                            if (err) {
                                window.plugin._addLog("copy so failed!");
                                console.log(err);
                            } else {
                                window.plugin._addLog("copy so success!");
                                step3();
                            }
                        });
                    }

                    // 3.拷贝代码
                    /* 将
                        CocosPlugin\bugly文件夹
                       拷贝到
                        frameworks\runtime-src\Classes里面
                       其实只需要用到CrashReport.h和CrashReport.mm，
                    */
                    function step3() {
                        window.plugin._addLog("copy code ..");

                        let buglyPath = PATH.join(buglyResPath, "bugly");
                        if (!FS.existsSync(buglyPath)) {
                            window.plugin._addLog("没有发现插件的bugly代码文件");
                            return;
                        }

                        let classPath = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/Classes/bugly");
                        if (!FS.existsSync(classPath)) {
                            FS.mkdirSync(classPath);
                        }

                        fse.copy(buglyPath, classPath, function (err) {
                            if (err) {
                                window.plugin._addLog("copy code failed!");
                                console.log(err);
                            } else {
                                window.plugin._addLog("copy code success!");
                                step4();
                            }
                        })

                    }

                    // 4.修改Android.mk
                    function step4() {

                        let mkFile = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/proj.android-studio/app/jni/Android.mk");

                        if (!FS.existsSync(mkFile)) {
                            window.plugin._addLog("不存在mk文件: " + mkFile);
                            doFailed();
                            return;
                        }

                        let data = FS.readFileSync(mkFile, 'utf-8');
                        // 增加bugly.so模块
                        let buglySoFlag =
                            "LOCAL_PATH := $(call my-dir)\n" +
                            "# --- bugly: 引用 libBugly.so ---\n" +
                            "include $(CLEAR_VARS)\n" +
                            "LOCAL_MODULE := bugly_native_prebuilt\n" +
                            "LOCAL_SRC_FILES := prebuilt/$(TARGET_ARCH_ABI)/libBugly.so\n" +
                            "include $(PREBUILT_SHARED_LIBRARY)\n" +
                            "# --- bugly: end ---";
                        if (data.indexOf(buglySoFlag) === -1) {
                            data = data.replace("LOCAL_PATH := $(call my-dir)", buglySoFlag);
                            window.plugin._addLog("[Android.mk] 增加libBugly.so引用");
                        } else {
                            window.plugin._addLog("[Android.mk] 已经增加libBugly.so引用");
                        }

                        // 增加CrashReport.mm编译文件
                        let AppDelegateFlag =
                            "\t\t\t\t   ../../../Classes/AppDelegate.cpp \\\n" +
                            "\t\t\t\t   ../../../Classes/bugly/CrashReport.mm \\\n";
                        if (data.indexOf(AppDelegateFlag) === -1) {
                            data = data.replace("\t\t\t\t   ../../../Classes/AppDelegate.cpp \\\n", AppDelegateFlag);
                            window.plugin._addLog("[Android.mk] 增加CrashReport.mm引用");
                        } else {
                            window.plugin._addLog("[Android.mk] 已经增加CrashReport.mm引用");
                        }

                        // 导入bugly
                        let extFlag =
                            "# --- bugly: 增加cpp扩展名mm\n" +
                            "LOCAL_CPP_EXTENSION := .mm .cpp .cc\n" +
                            "LOCAL_CFLAGS += -x c++\n" +
                            "LOCAL_SRC_FILES := hellojavascript/main.cpp";
                        if (data.indexOf(extFlag) === -1) {
                            data = data.replace("LOCAL_SRC_FILES := hellojavascript/main.cpp", extFlag);
                            window.plugin._addLog("[Android.mk] 增加cpp扩展名mm");
                        } else {
                            window.plugin._addLog("[Android.mk] 已经增加cpp扩展名mm");
                        }

                        FS.writeFileSync(mkFile, data);
                        step5();
                    }

                    // 5.修改AppDelegate.cpp
                    function step5() {
                        let AppDelegateCppFilePath = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/Classes/AppDelegate.cpp");
                        if (!FS.existsSync(AppDelegateCppFilePath)) {
                            window.plugin._addLog("没有发现文件: " + AppDelegateCppFilePath);
                            doFailed();
                            return;
                        }
                        let data = FS.readFileSync(AppDelegateCppFilePath, 'utf-8');
                        let newData = data;
                        // 添加头文件引入
                        let buglyHeadFlag =
                            "// bugly\n" +
                            "#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS)\n" +
                            "#include \"bugly/CrashReport.h\"\n" +
                            "#endif\n" +
                            "USING_NS_CC;";
                        if (data.indexOf(buglyHeadFlag) === -1) {
                            data = data.replace("USING_NS_CC;", buglyHeadFlag);
                            window.plugin._addLog("[AppDelegate.cpp] 添加bugly头文件引用");
                        } else {
                            window.plugin._addLog("[AppDelegate.cpp] 已经添加bugly头文件引用");
                        }
                        // 添加bugly初始化
                        let initFlag =
                            "bool AppDelegate::applicationDidFinishLaunching()\n" +
                            "{\n" +
                            "    // 初始化bugly\n" +
                            "#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS)\n" +
                            "     CrashReport::initCrashReport(\"" + window.plugin.gameID + "\", false);\n" +
                            "#endif";

                        if (data.indexOf(initFlag) === -1) {
                            data = data.replace(
                                "bool AppDelegate::applicationDidFinishLaunching()\n" +
                                "{", initFlag);
                            window.plugin._addLog("[AppDelegate.cpp] 添加bugly init code");
                        } else {
                            window.plugin._addLog("[AppDelegate.cpp] 已经添加bugly init code");
                        }

                        // js异常上报
                        let jsReportFlag = "setExceptionCallback([](const char* location, const char* message, const char* stack){\n" +
                            "        // Send exception information to server like Tencent Bugly.\n" +
                            "        #if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS)\n" +
                            "           CrashReport::reportException(CATEGORY_JS_EXCEPTION,  \"JSException\", message, stack);\n" +
                            "        #endif\n";

                        if (data.indexOf(jsReportFlag) === -1) {
                            data = data.replace("setExceptionCallback([](const char* location, const char* message, const char* stack){\n" +
                                "        // Send exception information to server like Tencent Bugly.\n", jsReportFlag);
                            window.plugin._addLog("[AppDelegate.cpp] 添加bugly ExceptionCallback code");
                        } else {
                            window.plugin._addLog("[AppDelegate.cpp] 已经添加bugly ExceptionCallback code");
                        }


                        FS.writeFileSync(AppDelegateCppFilePath, data);

                        doSuccess();
                    }

                    function doSuccess() {
                        window.plugin._addLog("成功添加bugly,请重新编译项目!");
                    }

                    function doFailed() {
                        window.plugin._addLog("添加bugly失败!");
                    }

                    step1();
                }
            }
        })
    },

    // register your ipc messages here
    messages: {
        'plugin-bugly:cleanLog'(event) {
            window.plugin.logView = [];
        },
        'plugin-bugly:queryBuildOptions'(event) {
            window.plugin.queryBuildOptions(a);
        },

    }
});