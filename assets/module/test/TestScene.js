cc.Class({
    extends: cc.Component,

    properties: {},


    onLoad() {
		console.log('TestScene');
		console.log(this);
        require('Native').rotationSceneToLandscape(false);

        let canvas = cc.find('Canvas');
        if (canvas) {
            let comp = canvas.getComponent(cc.Canvas);
            if (comp) {
                // comp.setDesignResolutionSize(1920, 1080);
                // comp.designResolution.width = 1920;
                // comp.designResolution.height = 1080;
                // canvas.rotation = -90;
            }
        }
    },

    start() {

    },
    onBtnClickTest() {
        cc.director.loadScene('IndexScene');
    }

});
