let fs = require('fire-fs');
let path = require('fire-path');
let electron = require('electron');
module.exports = {
    cfgData: {
        excelRootPath: null,// excel根路径
        jsFileName: null,
        jsonAllFileName: null,
        isMergeJson: null,
        isFormatJsCode: null,
        isFormatJson: null,
        isExportJson: null,
        isExportJs: null,
        isExportClient: null,
        isExportServer: null,
    },
    initCfg(cb) {
        let configFilePath = this._getAppCfgPath();
        let b = fs.existsSync(configFilePath);
        if (b) {
            console.log("cfg path: " + configFilePath);
            fs.readFile(configFilePath, 'utf-8', function (err, data) {
                if (!err) {
                    let saveData = JSON.parse(data.toString());
                    self.cfgData = saveData;
                    if (cb) {
                        cb(saveData);
                    }
                }
            }.bind(self));
        } else {
            if (cb) {
                cb(null);
            }
        }
    },
    saveCfgByData(data) {
        this.cfgData.excelRootPath = data.excelRootPath;
        this.cfgData.jsFileName = data.jsFileName;
        this.cfgData.jsonAllFileName = data.jsonAllFileName;
        this.cfgData.isMergeJson = data.isMergeJson;
        this.cfgData.isMergeJavaScript = data.isMergeJavaScript;
        this.cfgData.isFormatJsCode = data.isFormatJsCode;
        this.cfgData.isFormatJson = data.isFormatJson;
        this.cfgData.isExportJson = data.isExportJson;
        this.cfgData.isExportJs = data.isExportJs;
        this.cfgData.isExportClient = data.isExportClient;
        this.cfgData.isExportServer = data.isExportServer;
        this._save();
    },
    _save() {
        let savePath = this._getAppCfgPath();
        fs.writeFileSync(savePath, JSON.stringify(this.cfgData));
        console.log("save ok!");
    },
    _getAppCfgPath() {
        let userDataPath = null;
        if (electron.remote) {
            userDataPath = electron.remote.app.getPath('userData');
        } else {
            userDataPath = electron.app.getPath('userData');
        }
        let tar = Editor.libraryPath;
        tar = tar.replace(/\\/g, '-');
        tar = tar.replace(/:/g, '-');
        tar = tar.replace(/\//g, '-');
        return path.join(userDataPath, "excel-fucker-" + tar + ".json");
    },
};