export class ProgressInfo {
    public file
    public byte;
    public msg = '';
}

export class HotOptions {
    OnVersionInfo: Function;
    OnUpdateFailed: Function;
    OnUpdateSucceed: Function;
    OnUpdateProgress: Function;
    OnNeedUpdateVersion: Function;
}

class Hot {
    _assetsMgr: jsb.AssetsManager;
    _checkListener: null;
    _updateListener: null;
    _options: HotOptions;
    private manifestUrl: string;

    setOptions(opt: HotOptions) {
        this._options = opt;
    }

    // --------------------------------检查更新--------------------------------
    _compareVersion(versionA, versionB) {
        console.log("客户端版本: " + versionA + ', 当前最新版本: ' + versionB);
        this._options.OnVersionInfo({curVer: versionA, newVersion: versionB});
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            } else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        } else {
            return 0;
        }
    }

    reCheckVersion() {
        this._assetsMgr.downloadFailedAssets();
    }

    // 检查更新
    checkUpdate() {
        if (this._assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            this._assetsMgr.loadLocalManifest(this.manifestUrl);
        }
        if (!this._assetsMgr.getLocalManifest().isLoaded()) {
            console.log('加载本地 manifest 失败 ...');
            return;
        }
        if (this._checkListener !== null) {
            cc.eventManager.removeListener(this._checkListener);
            this._checkListener = null;
        }

        this._checkListener = new jsb.EventListenerAssetsManager(this._assetsMgr, this._checkCallBack.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);
        console.log("[HotUpdate] checkUpdate");
        this._assetsMgr.checkUpdate();
    }

    _checkCallBack(event) {
        cc.log('热更新检查结果: ' + event.getEventCode());
        let remoteManifest = this._assetsMgr.getRemoteManifest();
        let v = remoteManifest.getSearchPaths();
        for (let k = 0; k < v.length; k++) {
            let item = v[k];
            console.log(JSON.stringify(v[k]));
        }

        let code = event.getEventCode();
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log("没有发现本地的manifest, 跳过热更新.");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                console.log("下载 manifest 失败, 跳过热更新.");
                break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log("解析 manifest 失败, 跳过热更新.");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("已经和远程版本一致");
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                console.log('发现新版本,请更新');
                break;
            default:
                return;
        }
        if (this._checkListener !== null) {
            cc.eventManager.removeListener(this._checkListener);
            this._checkListener = null;
        }
        this._options.OnNeedUpdateVersion(code);
    }

    // --------------------------------开始更新--------------------------------
    hotUpdate() {
        if (this._assetsMgr) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._assetsMgr, this._hotUpdateCallBack.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);
            if (this._assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
                this._assetsMgr.loadLocalManifest(this.manifestUrl);
            }
            this._assetsMgr.update();
        }
    }

    _hotUpdateCallBack(event) {
        console.log("hotUpdate Code: " + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log('没有发现本地的 manifest, 跳过热更新.');
                this._onUpdateFailed();
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:// 下载成功
                let data = new ProgressInfo();
                // console.log(JSON.stringify(event));
                let filePro = event.getPercentByFile();
                if (!filePro) {
                    filePro = 0;
                }
                data.file = filePro.toFixed(2) || 1;
                data.byte = event.getPercent().toFixed(2);
                data.msg = "";
                let msg = event.getMessage();
                if (msg) {
                    console.log('Updated file: ' + msg);
                    cc.log(event.getPercent().toFixed(2) + '% : ' + msg);
                    data.msg = msg;
                }
                this._options.OnUpdateProgress(data);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log('下载 manifest 失败, 跳过热更新.');
                this._onUpdateFailed();
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log('已经和远程版本一致 ');
                this._onUpdateFailed();
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                console.log('更新完成 ' + event.getMessage());
                this._onUpdateFinished();
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                console.log('更新失败. ' + event.getMessage());
                this._onUpdateFailed();
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                console.log('资源更新发生错误: ' + event.getAssetId() + ', ' + event.getMessage());
                this._onUpdateFailed();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                console.log(event.getMessage());
                this._onUpdateFailed();
                break;
            default:
                //this._onUpdateFailed();
                break;
        }
    }

    _onUpdateFailed() {
        if (this._updateListener !== null) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        this._options.OnUpdateFailed(false);
    }

    // 更新完成
    _onUpdateFinished() {
        if (this._updateListener !== null) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        let searchPaths = jsb.fileUtils.getSearchPaths();
        let newPaths = this._assetsMgr.getLocalManifest().getSearchPaths();
        console.log("[HotUpdate] 搜索路径: " + JSON.stringify(newPaths));
        Array.prototype.unshift(searchPaths, newPaths);
        cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));

        jsb.fileUtils.setSearchPaths(searchPaths);
        this._options.OnUpdateSucceed(true);
    }

    // 移除临时manifest文件
    removeTmpManifestFile(storagePath) {
        // let tempStoragePath = storagePath + '_temp';// /
        //jsb.fileUtils.renameFile(this._storagePath+'/', this.TEMP_VERSION_FILENAME, this.VERSION_FILENAME);//
    }

    removeFile(file) {
        if (jsb.fileUtils.isFileExist(file)) {
            jsb.fileUtils.removeFile(file);
            if (!jsb.fileUtils.isFileExist(file)) {
                console.log('[HotUpdate] remove file success: ' + file);
            } else {
                console.log('[HotUpdate] remove file failed: ' + file);
            }
        } else {
            console.log("[HotUpdate] file not exist: " + file);
        }
    }

    // 移除临时资源目录
    removeTempDir(storagePath) {
        let tempStoragePath = storagePath + '_temp';
        this.removeDirectory(tempStoragePath);
    }

    removeDirectory(path) {
        if (jsb.fileUtils.isDirectoryExist(path)) {
            jsb.fileUtils.removeDirectory(path);
            if (!jsb.fileUtils.isDirectoryExist(path)) {
                console.log("[HotUpdate] removeDir success: " + path);
            } else {
                console.log("[HotUpdate] removeDir failed: " + path);
            }
        } else {
            console.log("[HotUpdate] dir not exist: " + path);
        }
    }

    showSearchPath() {
        console.log("========================搜索路径========================");
        let searchPaths = jsb.fileUtils.getSearchPaths();
        // console.log("search path:" + searchPaths);
        // let arr = searchPaths.split(',');
        // let arr = searchPaths;
        for (let i = 0; i < searchPaths.length; i++) {
            console.log("[" + i + "]: " + searchPaths[i]);
        }
        console.log("======================================================");
        // console.log("================================================================");
        // let str = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
        // let localPath = JSON.parse(str);
        // for (let i = 0; i < localPath.length; i++) {
        //     console.log("[HotUpdateSearchPaths]" + i + " :" + localPath[i]);
        // }
        // jsb.fileUtils.setSearchPaths(localPath);
    }

    // ------------------------------初始化------------------------------
    init(manifestUrl: string) {
        if (!cc.sys.isNative) {
            return;
        }
        this.showSearchPath();
        this.manifestUrl = manifestUrl;
        let storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset');
        console.log('热更新资源存放路径 : ' + storagePath);
        console.log('本地 manifest 路径 : ' + manifestUrl);
        // this.removeTempDir(storagePath);
        this._assetsMgr = new jsb.AssetsManager(manifestUrl, storagePath);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._assetsMgr.retain();
        }
        console.log('[HotUpdate] local packageUrl:' + this._assetsMgr.getLocalManifest().getPackageUrl());
        console.log('[HotUpdate] project.manifest remote url:' + this._assetsMgr.getLocalManifest().getManifestFileUrl());
        console.log('[HotUpdate] version.manifest remote url:' + this._assetsMgr.getLocalManifest().getVersionFileUrl());

        // 比较版本
        this._assetsMgr.setVersionCompareHandle(this._compareVersion.bind(this));

        this._assetsMgr.setVerifyCallback(function (path, asset) {
            let compressed = asset.compressed;
            let expectedMD5 = asset.md5;
            let relativePath = asset.path;
            let size = asset.size;
            if (compressed) {
                return true;
            } else {
                return true;
            }
        });

        // 安卓手机设置 最大并发任务数量限制为2
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._assetsMgr.setMaxConcurrentTask(10);
        }
    }
}

let hotInstance = new Hot();

export default hotInstance;
