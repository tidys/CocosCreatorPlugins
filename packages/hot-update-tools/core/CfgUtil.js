let fs = require('fs');
let path = require('path');
const {remote} = require('electron');
let FileUtil = Editor.require("packages://hot-update-tools/core/FileUtil");


let self = module.exports = {
    cfgData: {
        version: "",
        serverRootDir: "",
        resourceRootDir: "",
        genManifestDir: "",
        localServerPath: "",
    },
    saveConfig(data) {
        let configFilePath = self._getAppCfgPath();
        this.cfgData.version = data.version;
        this.cfgData.serverRootDir = data.serverRootDir;
        this.cfgData.resourceRootDir = data.resourceRootDir;
        this.cfgData.localServerPath = data.localServerPath;

        fs.writeFile(configFilePath, JSON.stringify(this.cfgData), function (error) {
            if (!error) {
                console.log("保存配置成功!");
            }
        }.bind(this));
    },
    cleanConfig() {
        fs.unlink(this._getAppCfgPath());
    },

    getMainFestDir() {
        let userDataPath = remote.app.getPath('userData');
        return path.join(userDataPath, "hot-update-tools-manifestOutPut");
        //输出文件不能存在在插件目录下，否则会造成插件刷新
        // return Editor.url('packages://hot-update-tools/outPut');
    },
    _getAppCfgPath() {
        let userDataPath = remote.app.getPath('userData');
        let tar = Editor.libraryPath;
        tar = tar.replace(/\\/g, '-');
        tar = tar.replace(/:/g, '-');
        return path.join(userDataPath, "hot-update-tools-cfg-" + tar + ".json");
        // return Editor.url('packages://hot-update-tools/save/cfg.json');
    },
    initCfg(cb) {
        let configFilePath = this._getAppCfgPath();
        let b = FileUtil.isFileExit(configFilePath);
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
    }
}