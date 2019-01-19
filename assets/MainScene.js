cc.Class({
    extends: cc.Component,

    properties: {
        f:cc.Prefab,
    },


    onLoad() {
        cc.log("TestScene");
        console.log(cc.app.GameMsg);
        debugger
        let t = require('module/NewScript')
        debugger
    },

    start() {
        if (CC_BUILD) {
            console.log("build 环境");
        } else {
            console.log("dev 环境");
        }
        console.log("TestScene");
    },


    // update (dt) {},
});
