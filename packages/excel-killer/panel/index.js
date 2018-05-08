let packageName = "excel-killer";
let fs = require('fire-fs');
let path = require('fire-path');
let CfgUtil = Editor.require('packages://' + packageName + '/core/CfgUtil.js');
let excelItem = Editor.require('packages://' + packageName + '/panel/item/excelItem.js');
let nodeXlsx = Editor.require('packages://' + packageName + '/node_modules/node-xlsx');
let Electron = require('electron');
let uglifyJs = Editor.require('packages://' + packageName + '/node_modules/uglify-js');
let fsExtra = Editor.require('packages://' + packageName + '/node_modules/fs-extra');
let jsonBeautifully = Editor.require('packages://' + packageName + '/node_modules/json-beautifully');
var chokidar = Editor.require('packages://' + packageName + '/node_modules/chokidar');


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


        excelItem.init();
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this._initPluginCfg();
            },
            init() {
            },
            data: {
                logView: "",
                excelRootPath: null,

                isMergeJson: false,
                isFormatJson: false,// 是否格式化Json
                jsonSavePath: null,//json文件存放目录
                isJsonAllCfgFileExist: false,// 是否单一配置文件存在
                jsonAllCfgFileName: null,// json配置文件名

                jsSavePath: null,// 插件资源目录
                jsFileName: null,//js配置文件名
                isJsFileExist: false,
                isFormatJsCode: false,
                excelArray: [],
                excelFileArr: [],
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                onBtnClickTellMe() {
                    // let data = nodeXlsx.parse(path.join(this.excelRootPath, 'test2.xlsx'));
                    // console.log(data);
                    // return;
                    let url = "http://wpa.qq.com/msgrd?v=3&uin=774177933&site=qq&menu=yes";
                    Electron.shell.openExternal(url);
                },
                _saveConfig() {
                    let data = {
                        excelRootPath: this.excelRootPath,
                        jsFileName: this.jsFileName,
                        jsonAllFileName: this.jsonAllCfgFileName,
                        isMergeJson: this.isMergeJson,
                        isFormatJsCode: this.isFormatJsCode,
                        isFormatJson: this.isFormatJson,
                    };
                    CfgUtil.saveCfgByData(data);
                },
                onBtnClickFreshExcel(){
                    this._onAnalyzeExcelDirPath(this.excelRootPath);
                },
                _watchDir(event, filePath) {
                    return;
                    console.log("监控文件....");
                    console.log(event, filePath);
                    let ext = path.extname(filePath);
                    if (ext === ".xlsx" || ext === ".xls") {
                        this._onAnalyzeExcelDirPath(this.excelRootPath);
                    }
                },
                onBtnClickHelpDoc() {
                    let url = "https://github.com/tidys/CocosCreatorPlugins/tree/master/packages/excel-killer/README.md";
                    Electron.shell.openExternal(url);
                },
                _initPluginCfg() {
                    console.log("initCfg");
                    CfgUtil.initCfg(function (data) {
                        if (data) {
                            this.excelRootPath = data.excelRootPath || "";
                            if (fs.existsSync(this.excelRootPath)) {
                                this._onAnalyzeExcelDirPath(this.excelRootPath);
                                chokidar.watch(this.excelRootPath, {
                                    usePolling: true,
                                    // interval: 1000,
                                    // awaitWriteFinish: {
                                    //     stabilityThreshold: 2000,
                                    //     pollInterval: 100
                                    // },
                                }).on('all', this._watchDir.bind(this));
                            } else {

                            }
                            this.jsFileName = data.jsFileName || "GameJsCfg";
                            this.jsonAllCfgFileName = data.jsonAllFileName || "GameJsonCfg";
                            this.isMergeJson = data.isMergeJson;
                            this.isFormatJsCode = data.isFormatJsCode;
                            this.isFormatJson = data.isFormatJson;
                            this.checkJsFileExist();
                            this.checkJsonAllCfgFileExist();
                        }
                    }.bind(this));
                    this._initCfgSavePath();// 默认json路径
                },
                _initCfgSavePath() {
                    let projectPath = Editor.projectInfo.path;
                    let pluginResPath = path.join(projectPath, "plugin-resource");
                    if (!fs.existsSync(pluginResPath)) {
                        fs.mkdirSync(pluginResPath);
                    }
                    let jsonSavePath = path.join(pluginResPath, "json");
                    if (!fs.existsSync(jsonSavePath)) {
                        fs.mkdirSync(jsonSavePath);
                    }
                    this.jsonSavePath = jsonSavePath;

                    let jsSavePath = path.join(pluginResPath, "js");
                    if (!fs.existsSync(jsSavePath)) {
                        fs.mkdirSync(jsSavePath);
                    }
                    this.jsSavePath = jsSavePath;
                },
                onBtnClickFormatJson() {
                    this.isFormatJson = !this.isFormatJson;
                    this._saveConfig();
                },
                // 是否合并json
                onBtnClickMergeJson() {
                    this.isMergeJson = !this.isMergeJson;
                    this._saveConfig();

                },
                // 打开合并的json
                onBtnClickJsonAllCfgFile() {
                    let saveFileFullPath = path.join(this.jsonSavePath, this.jsonAllCfgFileName + ".json");
                    if (fs.existsSync(saveFileFullPath)) {
                        Electron.shell.openItem(saveFileFullPath);
                        Electron.shell.beep();
                    } else {
                        // this._addLog("目录不存在：" + this.resourceRootDir);
                        this._addLog("目录不存在:" + saveFileFullPath);
                        return;
                    }
                },
                checkJsonAllCfgFileExist() {
                    let saveFileFullPath = path.join(this.jsonSavePath, this.jsonAllCfgFileName + ".json");
                    if (fs.existsSync(saveFileFullPath)) {
                        this.isJsonAllCfgFileExist = true;
                    } else {
                        this.isJsonAllCfgFileExist = false;
                    }
                },
                onBtnClickFormatJsCode() {
                    this.isFormatJsCode = !this.isFormatJsCode;
                    this._saveConfig();
                },
                onBtnClickOpenExcelRootPath() {
                    if (fs.existsSync(this.excelRootPath)) {
                        Electron.shell.showItemInFolder(this.excelRootPath);
                        Electron.shell.beep();
                    } else {
                        this._addLog("目录不存在：" + this.excelRootPath);
                    }
                },
                onBtnClickSelectExcelRootPath() {
                    let res = Editor.Dialog.openFile({
                        title: "选择Excel的根目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        if (dir !== this.excelRootPath) {
                            this.excelRootPath = dir;
                            chokidar.watch(this.excelRootPath).on('all', this._watchDir.bind(this));
                            this._onAnalyzeExcelDirPath(dir);
                            this._saveConfig();
                        }
                    }
                },
                // 修改js配置文件
                onJsFileNameChanged() {
                    this._saveConfig();
                },
                // 修改json配置文件
                onJsonAllCfgFileChanged() {
                    this._saveConfig();
                },
                // 查找出目录下的所有excel文件
                _onAnalyzeExcelDirPath(dir) {
                    // let dir = path.normalize("D:\\proj\\CocosCreatorPlugins\\doc\\excel-killer");
                    if (dir) {
                        // 查找json文件
                        let allFileArr = [];
                        let excelFileArr = [];
                        // 获取目录下所有的文件
                        readDirSync(dir);
                        // 过滤出来.xlsx的文件
                        for (let k in allFileArr) {
                            let file = allFileArr[k];
                            let extName = path.extname(file);
                            if (extName === ".xlsx" || extName === ".xls") {
                                excelFileArr.push(file);
                            } else {
                                this._addLog("不支持的文件类型: " + file);
                            }
                        }

                        this.excelFileArr = excelFileArr;
                        // 组装显示的数据
                        let excelSheetArray = [];
                        let sheetDuplicationChecker = {};//表单重名检测
                        for (let k in excelFileArr) {
                            let itemFullPath = excelFileArr[k];
                            // this._addLog("excel : " + itemFullPath);

                            let excelData = nodeXlsx.parse(itemFullPath);
                            //todo 检测重名的sheet
                            for (let j in excelData) {
                                let itemData = {
                                    isUse: true,
                                    fullPath: itemFullPath,
                                    name: "name",
                                    sheet: excelData[j].name
                                };
                                itemData.name = itemFullPath.substr(dir.length + 1, itemFullPath.length - dir.length);

                                if (excelData[j].data.length === 0) {
                                    this._addLog("[Error] 空Sheet: " + itemData.name + " - " + itemData.sheet);
                                    continue;
                                }

                                if (sheetDuplicationChecker[itemData.sheet]) {
                                    //  重名sheet问题
                                    this._addLog("[Error ] 出现了重名sheet: " + itemData.sheet);
                                    this._addLog("[Sheet1] " + sheetDuplicationChecker[itemData.sheet].fullPath);
                                    this._addLog("[Sheet2] " + itemFullPath);
                                    this._addLog("请仔细检查Excel-Sheet!");
                                } else {
                                    sheetDuplicationChecker[itemData.sheet] = itemData;
                                    excelSheetArray.push(itemData);
                                }
                            }
                        }
                        this.excelArray = excelSheetArray;


                        function readDirSync(dirPath) {
                            let dirInfo = fs.readdirSync(dirPath);
                            for (let i = 0; i < dirInfo.length; i++) {
                                let item = dirInfo[i];
                                let itemFullPath = path.join(dirPath, item);
                                let info = fs.statSync(itemFullPath);
                                if (info.isDirectory()) {
                                    // this._addLog('dir: ' + itemFullPath);
                                    readDirSync(itemFullPath);
                                } else if (info.isFile()) {
                                    let headStr = item.substr(0, 2);
                                    if (headStr === "~$") {
                                        window.plugin._addLog("检索到excel产生的临时文件:" + itemFullPath);
                                    } else {
                                        allFileArr.push(itemFullPath);
                                    }
                                    // this._addLog('file: ' + itemFullPath);
                                }
                            }
                        }
                    }
                },
                onBtnClickSelectSheet(event) {
                    let b = event.currentTarget.value;
                    for (let k in this.excelArray) {
                        this.excelArray[k].isUse = b;
                    }
                },
                onBtnClickOpenJsonSavePath() {
                    if (fs.existsSync(this.jsonSavePath)) {
                        Electron.shell.showItemInFolder(this.jsonSavePath);
                        Electron.shell.beep();
                    } else {
                        this._addLog("目录不存在：" + this.jsonSavePath);
                    }
                },
                onBtnClickOpenJsSavePath() {
                    if (fs.existsSync(this.jsSavePath)) {
                        Electron.shell.showItemInFolder(this.jsSavePath);
                        Electron.shell.beep();
                    } else {
                        this._addLog("目录不存在：" + this.jsSavePath);
                    }
                },
                _getJavaScriptSaveData(excelData, itemSheet) {
                    let title = excelData[0];
                    let desc = excelData[1];
                    let sheetFormatData = {};
                    for (let i = 2; i < excelData.length; i++) {
                        let lineData = excelData[i];
                        if (lineData.length === 0) {
                            // 空行直接跳过
                            continue;
                        } else {
                            if (lineData.length < title.length) {
                                this._addLog("[Error] 发现第" + i + "行缺少字段,跳过改行数据配置.");
                                continue;
                            } else if (lineData.length > title.length) {
                                this._addLog("[Error] 发现第" + i + "行多余字段,跳过改行数据配置.");
                                continue;
                            }
                        }
                        let saveLineData = {};
                        for (let j = 1; j < title.length; j++) {
                            let key = title[j];
                            let value = lineData[j];
                            if (value === undefined) {
                                value = "";
                                this._addLog("[Error] 发现空单元格:" + itemSheet.name + "*" + itemSheet.sheet + " => (" + key + "," + (i + 1) + ")");
                            }
                            saveLineData[key] = value;
                        }
                        sheetFormatData[lineData[0].toString()] = saveLineData;
                    }
                    return sheetFormatData;
                },
                _getJsonSaveData(excelData, itemSheet) {
                    let title = excelData[0];
                    let desc = excelData[1];
                    let ret = null;
                    let useFormat1 = false;
                    if (useFormat1) {
                        let saveData1 = [];// 格式1:对应的为数组
                        for (let i = 2; i < excelData.length; i++) {
                            let lineData = excelData[i];
                            if (lineData.length < title.length) {
                                continue;
                            } else if (lineData.length > title.length) {
                                continue;
                            }

                            let saveLineData = {};
                            for (let j = 0; j < title.length; j++) {
                                let key = title[j];
                                let value = lineData[j];
                                if (value === undefined) {
                                    value = "";
                                }
                                // this._addLog("" + value);
                                saveLineData[key] = value;
                            }
                            saveData1.push(saveLineData);
                        }
                        ret = saveData1;
                    } else {
                        let saveData2 = {};// 格式2:id作为索引
                        for (let i = 2; i < excelData.length; i++) {
                            let lineData = excelData[i];
                            if (lineData.length < title.length) {
                                continue;
                            } else if (lineData.length > title.length) {
                                continue;
                            }
                            let saveLineData = {};
                            for (let j = 1; j < title.length; j++) {
                                let key = title[j];
                                let value = lineData[j];
                                if (value === undefined) {
                                    value = "";
                                }
                                // this._addLog("" + value);
                                saveLineData[key] = value;
                            }
                            saveData2[lineData[0].toString()] = saveLineData;
                        }
                        ret = saveData2;
                    }
                    return ret;
                },
                // 打开生成的js配置文件
                onBtnClickOpenJsFile() {
                    let saveFileFullPath = path.join(this.jsSavePath, this.jsFileName + ".js");
                    if (fs.existsSync(saveFileFullPath)) {
                        Electron.shell.openItem(saveFileFullPath);
                        Electron.shell.beep();
                    } else {
                        this._addLog("目录不存在：" + this.saveFileFullPath);
                    }
                },
                // 检测js配置文件是否存在
                checkJsFileExist() {
                    let saveFileFullPath = path.join(this.jsSavePath, this.jsFileName + ".js");
                    if (fs.existsSync(saveFileFullPath)) {
                        this.isJsFileExist = true;
                    } else {
                        this.isJsFileExist = false;
                    }
                },
                // 生成配置
                onBtnClickGen() {
                    console.log("onBtnClickGen");
                    // 参数校验
                    if (this.excelArray.length <= 0) {
                        this._addLog("未发现要生成的配置!");
                        return;
                    }

                    if (this.isMergeJson) {
                        if (this.jsonAllCfgFileName.length <= 0) {
                            this._addLog("请输入要保存的json文件名!");
                            return;
                        }
                    }
                    if (this.jsFileName.length <= 0) {
                        this._addLog("请输入要保存的js文件名!");
                        return;
                    }


                    this.logView = "";
                    // 删除老的配置
                    fsExtra.emptyDirSync(this.jsonSavePath);
                    fsExtra.emptyDirSync(this.jsSavePath);
                    let jsSaveData = {};// 保存的js数据
                    let jsonAllSaveData = {};// 保存的json数据
                    for (let k in this.excelArray) {
                        let itemSheet = this.excelArray[k];
                        if (itemSheet.isUse) {
                            let excelData = nodeXlsx.parse(itemSheet.fullPath);
                            let sheetData = null;
                            for (let j in excelData) {
                                if (excelData[j].name === itemSheet.sheet) {
                                    sheetData = excelData[j].data;
                                }
                            }
                            if (sheetData) {
                                if (sheetData.length > 2) {
                                    // 保存为json
                                    let jsonSaveData = this._getJsonSaveData(sheetData, itemSheet);
                                    if (this.isMergeJson) {
                                        jsonAllSaveData[itemSheet.sheet] = jsonSaveData;
                                    } else {
                                        let saveStr = JSON.stringify(jsonSaveData);
                                        if (this.isFormatJson) {// 格式化json
                                            saveStr = jsonBeautifully(saveStr);
                                        }
                                        let saveFileFullPath = path.join(this.jsonSavePath, itemSheet.sheet + ".json");
                                        fs.writeFileSync(saveFileFullPath, saveStr);
                                        this._addLog("[Json]:" + saveFileFullPath);
                                    }
                                    // 保存为js
                                    let sheetJsData = this._getJavaScriptSaveData(sheetData, itemSheet);
                                    // 检测重复问题
                                    if (jsSaveData[itemSheet.sheet] === undefined) {
                                        jsSaveData[itemSheet.sheet] = sheetJsData;
                                    } else {
                                        this._addLog("发现重名sheet:" + itemSheet.name + "(" + itemSheet.sheet + ")");
                                    }
                                } else {
                                    this._addLog("行数低于2行,无效sheet:" + itemSheet.sheet);
                                }
                            } else {
                                this._addLog("未发现数据");
                            }

                        } else {
                            console.log("忽略配置: " + itemSheet.fullPath + ' - ' + itemSheet.sheet);
                        }
                    }
                    // =====================>>>>  保存json文件   <<<=================================
                    if (this.isMergeJson) {
                        let saveFileFullPath = path.join(this.jsonSavePath, this.jsonAllCfgFileName + ".json");
                        let str = JSON.stringify(jsonAllSaveData);
                        if (this.isFormatJson) {
                            str = jsonBeautifully(str);
                        }
                        fs.writeFileSync(saveFileFullPath, str);
                        this._addLog("[Json]:" + saveFileFullPath);
                    }
                    // =====================>>>>  保存js文件   <<<=================================
                    // TODO 保证key的顺序一致性
                    let saveFileFullPath = path.join(this.jsSavePath, this.jsFileName + ".js");
                    let saveStr = "module.exports = " + JSON.stringify(jsSaveData) + ";";
                    if (this.isFormatJsCode) {// 保存为格式化代码
                        let ast = uglifyJs.parse(saveStr);
                        let ret = uglifyJs.minify(ast, {
                            output: {
                                beautify: true,//如果希望得到格式化的输出，传入true
                                indent_start: 0,//（仅当beautify为true时有效） - 初始缩进空格
                                indent_level: 4,//（仅当beautify为true时有效） - 缩进级别，空格数量
                            }
                        });
                        if (ret.error) {
                            this._addLog('error: ' + ret.error.message);
                        } else if (ret.code) {
                            fs.writeFileSync(saveFileFullPath, ret.code);
                            this._addLog("[JavaScript]" + saveFileFullPath);
                        } else {
                            this._addLog(JSON.stringify(ret));
                        }
                    } else {// 保存为单行代码
                        fs.writeFileSync(saveFileFullPath, saveStr);
                        this._addLog("[JavaScript]" + saveFileFullPath);
                    }
                    this._addLog("全部转换完成!");
                    this.checkJsFileExist();
                    this.checkJsonAllCfgFileExist();
                },

            },

        });
    },

    messages: {
        'excel-killer:hello'(event) {
        }
    }
});