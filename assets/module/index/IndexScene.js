cc.Class({
    extends: cc.Component,

    properties: {
        tipsLabel: {displayName: "提示", default: null, type: cc.Label},
        word: {displayName: "提示语", default: ""},
    },

    onLoad(){
      require('Native').rotationSceneToLandscape(true);
	  console.log('IndexScene');
	  console.log(this);
    },
    start() {
        this.tipsLabel.string = this.word;
        // cc.view.setCanvasSize(1920, 1080);
        // this.tipsLabel.string = this.word + "- new Version";
    },

    update(dt) {

    },
    onBtnClickTest() {
        cc.director.loadScene('TestScene');
    },
});
