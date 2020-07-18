import {ProgressInfo, HotOptions} from "./HotUpdate";
import HotUpdate from './HotUpdate'
import * as DialogMgr from "../../core/ui/DialogMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property({displayName: 'project.manifest', type: cc.Asset,})
    manifest: cc.Asset = null;

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
        options.OnUpdateProgress = (event: jsb.EventAssetsManager) => {
            let bytes = event.getDownloadedBytes() + '/' + event.getTotalBytes();
            let files = event.getDownloadedFiles() + '/' + event.getTotalFiles();

            let file = event.getPercentByFile().toFixed(2);
            let byte = event.getPercent().toFixed(2);
            let msg = event.getMessage();

            console.log('[update]: 进度=' + file);
            this.updateProgress.progress = parseFloat(file);
            this.tipsLabel.string = '正在更新中,请耐心等待';
            console.log(msg);
        };
        options.OnNeedUpdateVersion = (data) => {
            DialogMgr.showTipsWithOkBtn('检测到新版本,点击确定开始更新', () => {
                HotUpdate.hotUpdate();
            });
        };
        options.OnUpdateFailed = () => {
            this.tipsLabel.string = '更新失败';
            cc.log('热更新失败');
            DialogMgr.showTipsWithOkBtn('更新失败,点击重试', () => {
                HotUpdate.checkUpdate();
            });

        };
        options.OnUpdateSucceed = () => {
            this.tipsLabel.string = '更新成功';
            cc.log('更新成功');
            DialogMgr.showTipsWithOkBtn('更新成功,点击确定重启游戏', () => {
                cc.audioEngine.stopAll();
                cc.game.restart();
            });
        };
        HotUpdate.setOptions(options);

        this._initView();
    }


    _onShowDownLoadUpdateVersionResult(result) {
        if (result) {

        } else {

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

        DialogMgr.showTipsWithOkBtn('更新成功', () => {
            if (cc.sys.isBrowser) {
            } else {

                cc.director.loadScene('IndexScene');
            }
        });
    }

    onBtnClickReStart() {
        if (cc.sys.isNative) {
            cc.game.restart();
        } else {
            console.log('don\'t reStart');
        }
    }
}
