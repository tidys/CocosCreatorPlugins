let ObserverMgr = require("ObserverMgr");
cc.Class({
    extends: cc.Component,

    _initMsg() {
        let list = this._getMsgList();
        for (let k = 0; k < list.length; k++) {
            let msg = list[k];
            ObserverMgr.addEventListener(msg, this._onMsg, this);
        }
        ObserverMgr.addEventListener(GameMsgGlobal.Net.MsgErr, this._onErrorDeal, this);
    },
    onLoad() {
    },
    _getMsgList() {
        return [];
    },
    // [子类继承接口]消息返回
    _onMsg(msg, data) {
        //let len = "error-".length;
        //msg = msg.substr(len, msg.length - len);
        //return msg;
    },
    // [子类继承接口]游戏内逻辑错误
    _onError(msg, code, data) {

    },
    // [子类继承接口]网络 重新/第一次 打开
    _onNetOpen() {

    },

    //处理错误数据
    _onErrorDeal(errorMsgString, data) {
        let msgString = data[0];
        let errorCode = data[1];
        let errorData = data[2];
        this._onError(msgString, errorCode, errorData);
    },
    onDisable() {
        ObserverMgr.removeEventListenerWithObject(this);
    },
    onEnable() {
        // TODO next version register event method
        // ObserverMgr.removeEventListenerWithObject(this);
        // this._initMsg();
    },
    onDestroy() {
        ObserverMgr.removeEventListenerWithObject(this);
    },
});