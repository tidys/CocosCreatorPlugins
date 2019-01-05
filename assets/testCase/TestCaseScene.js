let TestCaseModule = require("TestCaseModule");
cc.Class({
    extends: require('Observer'),

    properties: {
        testPrefab: cc.Prefab,
        infoLabel: cc.Label,
        _num: 0,
    },

    _getMsgList() {
        return [
            TestCaseModule.Msg.Test,
        ];
    },
    _onMsg(msg, data) {
        if (msg === TestCaseModule.Msg.Test) {
            console.log(data);
            this.infoLabel.string = `${data}-${this._num++}`;
        }
    },
    onLoad() {
    },

    start() {

    },
    onBtnClickTestObserver() {
        cc.ObserverMgr.dispatchMsg(TestCaseModule.Msg.Test, "测试信息");
    },
    onBtnClickAddPrefab() {
        let node = cc.instantiate(this.testPrefab);
        this.node.addChild(node);
    },

    // update (dt) {},
});
