let fs = require('fire-fs');
let path = require('fire-path');
let electron = require('electron');
let FileUtil = Editor.require("packages://hot-update-tools/core/FileUtil");


let self = module.exports = {
    cfgData: {
        version: "",
        serverRootDir: "",
        resourceRootDir: "",
        genManifestDir: "",
        localServerPath: "",

        hotAddressArray: [],
        buildTime: null,// 构建时间,全部保存int值
        genTime: null,// manifest生成时间
        genVersion: null,// manifest版本
    },
    updateBuildTimeByMain(time) {
        // 在main.js中调用electron中没有remote属性
        // Editor.log(electron.app.getPath('userData'));
        let cfgPath = this._getAppCfgPath();
        if (fs.existsSync(cfgPath)) {
            let data = fs.readFileSync(cfgPath, 'utf-8');
            let json = JSON.parse(data);
            json.buildTime = time;
            json.genTime = time;
            fs.writeFileSync(cfgPath, JSON.stringify(json));
        } else {
            Editor.log("热更新配置文件不存在: " + cfgPath);
        }
    },
    updateBuildTime(time) {
        this.cfgData.buildTime = time;
        this.cfgData.genTime = time;
        this._save();
    },
    updateGenTime(time, version) {
        this.cfgData.genTime = time;
        this.cfgData.genVersion = version;
        this._save();
    },
    // 获取构建时间生成时间
    getBuildTimeGenTime() {
        let ret = {buildTime: null, genTime: null};
        let cfgPath = this._getAppCfgPath();
        if (fs.existsSync(cfgPath)) {
            let data = fs.readFileSync(cfgPath, 'utf-8');
            let json = JSON.parse(data);
            ret.buildTime = json.buildTime;
            ret.genTime = json.genTime;
            this.cfgData.buildTime = json.buildTime;
            this.cfgData.genTime = json.genTime;
        }
        return ret;
    },
    saveConfig(data) {
        this.cfgData.version = data.version;
        this.cfgData.serverRootDir = data.serverRootDir;
        this.cfgData.resourceRootDir = data.resourceRootDir;
        this.cfgData.localServerPath = data.localServerPath;
        this.cfgData.hotAddressArray = data.hotAddressArray;
        this._save();
    },
    _save() {
        let configFilePath = self._getAppCfgPath();
        let ret = fs.writeFileSync(configFilePath, JSON.stringify(this.cfgData));
        console.log("保存配置成功!");
    },
    cleanConfig() {
        fs.unlink(this._getAppCfgPath());
    },

    // manifest文件包地址
    getMainFestDir() {
        let userDataPath = electron.remote.app.getPath('userData');
        return path.join(userDataPath, "hot-update-tools-manifestOutPut");
        //输出文件不能存在在插件目录下，否则会造成插件刷新
        // return Editor.url('packages://hot-update-tools/outPut');
    },
    // 获取打包目录地址,一般放在项目目录下
    getPackZipDir() {
        let userDataPath = electron.remote.app.getPath('userData');
        return path.join(this._getAppRootPath(), "packVersion");
    },
    _getAppRootPath() {
        let lib = Editor.libraryPath;
        return lib.substring(0, lib.length - 7);
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