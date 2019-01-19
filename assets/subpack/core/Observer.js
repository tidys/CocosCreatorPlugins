let Observer = cc.Class({
    extends: cc.Component,

    _initMsg() {
        let list = this._getMsgList();
        if (list) {
            for (let k = 0; k < list.length; k++) {
                let msg = list[k];
                cc.ObserverMgr.addEventListener(msg, this._onMsg, this);
            }
        }
    },
    ctor() {
        this._initMsg();
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
    //处理错误数据
    _onErrorDeal(errorMsgString, data) {
        let msgString = data[0];
        let errorCode = data[1];
        let errorData = data[2];
        this._onError(msgString, errorCode, errorData);
    },
    onDisable() {
        cc.ObserverMgr.removeEventListenerWithObject(this);
    },
    onEnable() {
        // TODO next version register event method
        // ObserverMgr.removeEventListenerWithObject(this);
        // this._initMsg();
    },
    onDestroy() {
        cc.ObserverMgr.removeEventListenerWithObject(this);
    },
});
cc.Observer = module.exports = Observer;