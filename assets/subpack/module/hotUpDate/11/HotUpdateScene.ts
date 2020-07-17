import {ProgressInfo, HotOptions} from "./HotUpdate";
import HotUpdate from './HotUpdate'
import DialogMgr from "../ui/DialogMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property({displayName: 'project.manifest', type: cc.Asset,})
    manifest: string = null;

    @property({displayName: '版本号', type: cc.Label,})
    versionLabel: cc.Label = null;

    @property({displayName: '热更新进度条', type: cc.ProgressBar})
    updateProgress: cc.ProgressBar = null;

    @property({displayName: '消息提示', type: cc.Label})
    tipsLabel: cc.Label = null;

    @property({displayName: '添加节点', type: cc.Node})
    addNode: cc.Node = null;


    start() {

    }


    _updateVersionView(curVer, newVer) {
        this.versionLabel.string = '服务器版本号: ' + newVer + ',本地版本:' + curVer;
    }

    onLoad() {
        let options = new HotOptions();
        options.OnVersionInfo = (data) => {
            // GameLocalStorage.setVersion(data.curVer, data.newVersion);
            this._updateVersionView(data.curVer, data.newVersion);
        };
        options.OnUpdateProgress = (data: ProgressInfo) => {
            console.log('[update]: 进度=' + data.file);
            this.updateProgress.progress = data.file;
            // data.msg;
            this.tipsLabel.string = '正在更新中,请耐心等待';
            console.log(data.msg);
        };
        options.OnNeedUpdateVersion = (data) => {
            if (data === jsb.EventAssetsManager.NEW_VERSION_FOUND) {
                this._onShowNoticeUpdateLayer();
            } else if (data === jsb.EventAssetsManager.ALREADY_UP_TO_DATE) {// 版本一致,无需更新
                cc.log('版本一致,无需更新,进入游戏中...');
                this._enterGame();
            } else {
                this._onShowNoticeCheckVersionFailed();
            }
        };
        options.OnUpdateFailed = () => {

            this.tipsLabel.string = '更新失败';
            cc.log('热更新失败');
            this._onShowDownLoadUpdateVersionResult(false);

        }
        options.OnUpdateSucceed = () => {
            this.tipsLabel.string = '更新成功';
            cc.log('更新成功');
            this._onShowDownLoadUpdateVersionResult(true);
        }
        HotUpdate.setOptions(options)
        HotUpdate.checkUpdate();

        this._initView();
        // this._checkUpdate();

        // HotUpdate.showSearchPath();
    }


    _onShowNoticeUpdateLayer() {
        cc.log('提示更新');
        DialogMgr.showTipsWithOkBtn('检测到新版本,点击确定开始更新', function () {
            HotUpdate.hotUpdate();
        }.bind(this));
    }

    _onShowNoticeCheckVersionFailed() {
        cc.log('检查更新失败');
        DialogMgr.showTipsWithOkBtn('检查更新失败,点击重试', function () {
            HotUpdate.checkUpdate();
        }.bind(this));
    }

    _onShowDownLoadUpdateVersionResult(result) {
        if (result) {
            DialogMgr.showTipsWithOkBtn('更新成功,点击确定重启游戏', function () {
                cc.audioEngine.stopAll();
                cc.game.restart();
            }.bind(this));
        } else {
            DialogMgr.showTipsWithOkBtn('更新失败,点击重试', function () {
                HotUpdate.checkUpdate();
            }.bind(this));
        }
    }

    _initView() {
        this.tipsLabel.string = '';
        this.versionLabel.string = '';
        this.updateProgress.progress = 0;
        this.addNode.destroyAllChildren();
    }

    // 检查更新
    _checkUpdate() {
        if (cc.sys.isNative) {
            if (this.manifest) {
                let str = '正在获取版本...';
                this.tipsLabel.string = str;
                cc.log(str);

                HotUpdate.init(this.manifest);
                HotUpdate.checkUpdate();
            }
        } else {
            cc.log('web 平台不需要热更新');
            this._enterGame();
        }
    }

    onBtnClickCheckUpdate() {
        this._checkUpdate();
    }

    _enterGame() {
        cc.log('进入游戏成功');
        this.updateProgress.node.active = false;

        DialogMgr.showTipsWithOkBtn('更新成功', function () {
            cc.director.loadScene('IndexScene');
            // cc.director.loadScene("TestGameScene");
        }.bind(this));
    }

    onBtnClickReStart() {
        if (cc.sys.isNative) {
            cc.game.restart();
        } else {
            console.log('don\'t reStart');
        }
    }
}
