cc.Class({
    extends: cc.Component,

    properties: {
        graphics: {displayName: "绘图", default: null, type: cc.Graphics},
        testNode: {displayName: "测试节点", default: null, type: cc.Node},
        tipsLabel:{displayName:"提示信息", default:null, type:cc.Label},
    },

   
    onLoad () {},

    start () {

    },
    onBtnClickTest() {
        let bezier = [cc.p(-500, 0), cc.p(500, 0), cc.p(500, 400), cc.p(600, 450), cc.p(600, 0)];
        this.graphics.lineWidth = 5;
        this.graphics.fillColor = cc.hexToColor('#ff0000');


        this._drawPath(bezier, cc.hexToColor('#08ff28'));


        let windowSize = cc.view.getDesignResolutionSize();
        let bezierTo = cc.customBezierTo(5, bezier);

        let bezierTo1 = cc.bezierTo(5, bezier);

        this.tipsLabel.string = "*";
        this.tipsLabel.node.setPosition(bezier[0]);
        this.tipsLabel.node.stopAllActions();

        let pointArr = bezierTo.getBezierLinePoint(200);
        this._drawPath(pointArr, cc.hexToColor('#ffe000'));

        this.tipsLabel.node.runAction(bezierTo);


        cc.bezierAt111 = function (a, b, c, d, t) {
            return (Math.pow(1 - t, 3) * a +
                3 * t * (Math.pow(1 - t, 2)) * b +
                3 * Math.pow(t, 2) * (1 - t) * c +
                Math.pow(t, 3) * d);
        };


    },
    _drawPath(bezier, strokeColor) {
        this.graphics.strokeColor = strokeColor;
        for (let i = 0; i < bezier.length - 1; i++) {
            this.graphics.moveTo(bezier[i].x, bezier[i].y);
            this.graphics.lineTo(bezier[i + 1].x, bezier[i + 1].y);
        }
        // this.graphics.fill();
        this.graphics.close();
        this.graphics.stroke();
    },
    onBtnClickTestCustomAni() {
        this.testNode.addComponent(cc.CustomAni);
        let animation = this.testNode.addComponent(cc.Animation);
        // cc.AnimationClip.createWithSpriteFrames();
        console.log(animation);
    }

});
