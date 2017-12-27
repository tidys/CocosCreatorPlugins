cc.Class({
    extends: cc.Component,

    properties: {
        bgNode: {displayName: "背景节点", default: null, type: cc.Node},
    },


    onLoad() {
        let w = cc.view.getVisibleSize().width;
        let h = cc.view.getVisibleSize().height;
        this.bgNode.width = w;
        this.bgNode.height = h;

        this.bgNode.on(cc.Node.EventType.MOUSE_ENTER, function (event) {
            event.stopPropagation();
            event.stopPropagationImmediate();

            return false;
        }.bind(this));

        this.bgNode.on(cc.Node.EventType.MOUSE_LEAVE, function (event) {
            event.stopPropagation();
            event.stopPropagationImmediate();
            return false;
        }.bind(this));

        this.bgNode.on(cc.Node.EventType.MOUSE_WHEEL, function (event) {
            event.stopPropagation();
            event.stopPropagationImmediate();

        }.bind(this));
    },

    start() {

    },
    addUI(ui) {
        let node = cc.instantiate(ui);
        node.x = node.y = 0;
        this.node.addChild(node);
        return node;
    },

    // update (dt) {},
});
