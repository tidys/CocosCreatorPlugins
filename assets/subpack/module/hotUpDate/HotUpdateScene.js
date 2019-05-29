let HotUpdate = require("HotUpdate");
let Observer = require("Observer");
let Util = require("Util");
let DialogMgr = require('DialogMgr');
let GameLocalStorage = require("GameLocalStorage");
let HotUpdateModule = require('HotUpdateModule');

cc.Class({
    extends: Observer,

    properties: {
        manifest: {displayName: "project.manifest", default: null, url: cc.RawAsset},
        versionLabel: {default: null, displayName: "版本号", type: cc.Label},
        updateProgress: {displayName: "热更新进度条", default: null, type: cc.ProgressBar},
        tipsLabel: {displayName: "消息提示", default: null, type: cc.Label},
        addNode: {displayName: "添加节点", default: null, type: cc.Node},
    },

    _onMsg(msg, data) {
        if (msg === HotUpdateModule.Msg.OnUpdateVersionResult) {// 热更新结果
            if (data) {
                this.tipsLabel.string = "更新成功";
                Util.log("更新成功");
                this._onShowDownLoadUpdateVersionResult(true);
            } else {
                this.tipsLabel.string = "更新失败";
                Util.log("热更新失败");
                this._onShowDownLoadUpdateVersionResult(false);
            }
        } else if (msg === HotUpdateModule.Msg.OnUpdateProgress) {// 热更新进度
            console.log("[update]: 进度=" + data.fileProgress);
            this.updateProgress.progress = data.fileProgress;
            // data.msg;
            this.tipsLabel.string = "正在更新中,请耐心等待";
            console.log(data.msg);
        } else if (msg === HotUpdateModule.Msg.OnTipUpdateVersion) {// 提示更新版本
            if (data === jsb.EventAssetsManager.NEW_VERSION_FOUND) {
                this._onShowNoticeUpdateLayer();
            } else if (data === jsb.EventAssetsManager.ALREADY_UP_TO_DATE) {// 版本一致,无需更新
                Util.log("版本一致,无需更新,进入游戏中...");
                this._enterGame();
            } else {
                this._onShowNoticeCheckVersionFailed();
            }
        } else if (msg === HotUpdateModule.Msg.OnGetVersionInfo) {// 获取到版本信息
            GameLocalStorage.setVersion(data.curVer, data.newVersion);
            this._updateVersionView(data.curVer, data.newVersion);
        }
    },
    _updateVersionView(curVer, newVer) {
        this.versionLabel.string = "服务器版本号: " + newVer + ",本地版本:" + curVer;
    },
    _getMsgList() {
        return [
            HotUpdateModule.Msg.OnGetVersionInfo,
            HotUpdateModule.Msg.OnTipUpdateVersion,
            HotUpdateModule.Msg.OnUpdateProgress,
            HotUpdateModule.Msg.OnUpdateVersionResult,
        ];
    },
    onLoad: function () {
        this._initMsg();
        this._initView();
        // this._checkUpdate();
        this._initVersionFlag();
        // HotUpdate.showSearchPath();
    },
    start() {
        // require('InspectorScript').inspectorSupport();
    },
    _initVersionFlag() {
        /*if (GameCfg.isDebugVersion) {
            Util.log("debug version");
            this.debugLabel.string = "Debug";
            this.debugLabel.node.active = true;
        } else {
            Util.log("release version");
            this.debugLabel.string = "";
            this.debugLabel.node.active = false;
        }*/
    },
    _onShowNoticeUpdateLayer() {
        Util.log("提示更新");
        DialogMgr.showTipsWithOkBtn("检测到新版本,点击确定开始更新", function () {
            HotUpdate.hotUpdate();
        }.bind(this));
    },
    _onShowNoticeCheckVersionFailed() {
        Util.log('检查更新失败');
        DialogMgr.showTipsWithOkBtn("检查更新失败,点击重试", function () {
            HotUpdate.checkUpdate();
        }.bind(this));
    },
    _onShowDownLoadUpdateVersionResult(result) {
        if (result) {
            DialogMgr.showTipsWithOkBtn("更新成功,点击确定重启游戏", function () {
                cc.audioEngine.stopAll();
                cc.game.restart();
            }.bind(this));
        } else {
            DialogMgr.showTipsWithOkBtn("更新失败,点击重试", function () {
                HotUpdate.checkUpdate();
            }.bind(this));
        }
    },
    _initView() {
        this.tipsLabel.string = "";
        this.versionLabel.string = "";
        this.updateProgress.progress = 0;
        this.addNode.destroyAllChildren();
    },
    // 检查更新
    _checkUpdate() {
        if (cc.sys.isNative) {
            if (this.manifest) {
                let str = "正在获取版本...";
                this.tipsLabel.string = str;
                Util.log(str);

                HotUpdate.init(this.manifest);
                HotUpdate.checkUpdate();
            }
        } else {
            Util.log("web 平台不需要热更新");
            this._enterGame();
        }
    },
    onBtnClickCheckUpdate() {
        this._checkUpdate();
    },
    _enterGame() {
        Util.log("进入游戏成功");
        this.updateProgress.node.active = false;

        DialogMgr.showTipsWithOkBtn("更新成功", function () {
            cc.director.loadScene("IndexScene");
            // cc.director.loadScene("TestGameScene");
        }.bind(this));
    },
    onBtnClickReStart() {
        if (cc.sys.isNative) {
            cc.game.restart();
        } else {
            console.log("don't reStart");
        }
    }
});
