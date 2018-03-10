let packageName = "excel-fucker";
let fs = require('fire-fs');
let path = require('fire-path');
let CfgUtil = Editor.require('packages://' + packageName + '/core/CfgUtil.js');
let excelItem = Editor.require('packages://' + packageName + '/panel/item/excelItem.js');
let nodeXlsx = Editor.require('packages://' + packageName + '/node_modules/node-xlsx');
let Electron = require('electron');

Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",


    $: {},

    ready() {
        excelItem.init();
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this._initPluginCfg();
            },
            data: {
                excelRootPath: null,
                jsonSavePath: null,
                excelArray: [],
                excelFileArr: [],
            },
            methods: {
                _initPluginCfg() {
                    console.log("initCfg");
                    CfgUtil.initCfg(function (data) {
                        if (data) {
                            this.excelRootPath = data.excelRootPath || "";
                            if (fs.existsSync(this.excelRootPath)) {
                                this._onAnalyzeExcelDirPath(this.excelRootPath);
                            }
                        }
                    }.bind(this));
                    this._initJsonSavePath();// 默认json路径
                },
                _initJsonSavePath() {
                    let projectPath = Editor.projectInfo.path;
                    let jsonSavePath = path.join(projectPath, "plugin-resource");
                    if (!fs.existsSync(jsonSavePath)) {
                        fs.mkdirSync(jsonSavePath);
                    }

                    jsonSavePath = path.join(jsonSavePath, "json");
                    if (!fs.existsSync(jsonSavePath)) {
                        fs.mkdirSync(jsonSavePath);
                    }
                    this.jsonSavePath = jsonSavePath;
                },
                onBtnClickSelectExcelRootPath() {
                    let res = Editor.Dialog.openFile({
                        title: "选择Excel的根目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.excelRootPath = dir;
                        this._onAnalyzeExcelDirPath(dir);
                        this._saveConfig();
                    }
                },
                _onAnalyzeExcelDirPath(dir) {
                    // let dir = path.normalize("D:\\proj\\CocosCreatorPlugins\\doc\\excel-fucker");
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
                            if (extName === ".xlsx") {
                                excelFileArr.push(file);
                            } else {
                                console.log("不支持的文件类型: " + file);
                            }
                        }

                        this.excelFileArr = excelFileArr;
                        // 组装显示的数据
                        let excelSheetArray = [];
                        for (let k in excelFileArr) {
                            let itemFullPath = excelFileArr[k];
                            console.log("excel : " + itemFullPath);

                            let excelData = nodeXlsx.parse(itemFullPath);
                            for (let j in excelData) {
                                let itemData = {
                                    isUse: true,
                                    fullPath: itemFullPath,
                                    name: "name",
                                    sheet: excelData[j].name
                                };
                                itemData.name = itemFullPath.substr(dir.length + 1, itemFullPath.length - dir.length);
                                excelSheetArray.push(itemData);
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
                                    // console.log('dir: ' + itemFullPath);
                                    readDirSync(itemFullPath);
                                } else if (info.isFile()) {
                                    allFileArr.push(itemFullPath);
                                    // console.log('file: ' + itemFullPath);
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
                        // this._addLog("目录不存在：" + this.resourceRootDir);
                        return;
                    }
                },
                _saveToJavaScript(excelData, itemSheet) {
                    // 以key的形式作为索引值
                },
                _saveToJson(excelData, itemSheet) {
                    let title = excelData[0];
                    let desc = excelData[1];
                    let saveData = [];
                    for (let i = 2; i < excelData.length; i++) {
                        let lineData = excelData[i];
                        let saveLineData = {};
                        for (let j = 0; j < title.length; j++) {
                            let key = title[j];
                            let value = lineData[j];
                            // console.log("" + value);
                            saveLineData[key] = value;
                        }
                        saveData.push(saveLineData);
                    }
                    // 保存
                    let saveStr = JSON.stringify(saveData);
                    let saveFileFullPath = path.join(this.jsonSavePath, itemSheet.sheet + ".json");
                    fs.writeFileSync(saveFileFullPath, saveStr);
                    console.log("转换成json文件成功:" + saveFileFullPath);
                },
                onBtnClickGenJson() {
                    console.log("onBtnClickGenJson");
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
                                    this._saveToJson(sheetData, itemSheet);
                                } else {
                                    console.log("行数低于2行,无效sheet:" + itemSheet.sheet);
                                }
                            } else {
                                console.log("未发现数据");
                            }

                        } else {
                            console.log("文件未启用: " + itemSheet.fullPath + '\\' + itemSheet.sheet);
                        }
                    }
                    console.log("全部转换完成!");
                },
                _saveConfig() {
                    let data = {
                        excelRootPath: this.excelRootPath,
                    };
                    CfgUtil.saveCfgByData(data);
                },
            }
        });
    },

    messages: {
        'excel-fucker:hello'(event) {
        }
    }
});