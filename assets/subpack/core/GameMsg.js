let GameMsg = module.exports = {
    Test: "111",
    TestFunc(){
        console.log("TestFunc");
    }
}
cc.app = cc.app || {};
cc.app.GameMsg = GameMsg;
// 在引擎渲染之前就能执行的逻辑
cc.app.GameMsg.TestFunc();