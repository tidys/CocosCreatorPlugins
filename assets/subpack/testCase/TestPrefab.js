cc.Class({
    extends: cc.Component,

    properties: {},


    onLoad() {
    },

    start() {

    },
    onBtnClickTest() {
        cc.ObserverMgr.dispatchMsg(require("TestCaseModule").Msg.Test, "Testprefab");

    },
    onBtnClickClose(){
      this.node.destroy();
    },
    // update (dt) {},
});
