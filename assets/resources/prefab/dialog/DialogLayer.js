cc.Class({
    extends: cc.Component,

    properties: {
        okBtn: {displayName: "确定按钮", default: null, type: cc.Node},
        cancelBtn: {displayName: "取消按钮", default: null, type: cc.Node},
        closeBtn: {displayName: "关闭按钮", default: null, type: cc.Node},

        tipsLabel: {displayName: "提示语", default: null, type: cc.Label},

        _okCb: null,
        _cancelCb: null,
        _closeCb: null,
    },

    onLoad: function () {

    },
    showTipsWithOkBtn(word, okCb, cancelCb, closeCb) {
        this.okBtn.active = true;
        this.cancelBtn.active = false;
        this.tipsLabel.string = word;

        this._okCb = okCb;
        this._cancelCb = cancelCb;
        this._closeCb = closeCb;
    },
    showTipsWithOkCancelBtn(word, okCb, cancelCb, closeCb) {
        this.okBtn.active = true;
        this.cancelBtn.active = true;
        this.tipsLabel.string = word;

        this._okCb = okCb;
        this._cancelCb = cancelCb;
        this._closeCb = closeCb;
    },
    setCloseBtnVisible(b) {
        this.closeBtn.active = b;
    },
    onClickBtnOk() {
        //添加声音资源
        if (this._okCb) {
            this._okCb();
        }
        if (this.node) {
            this.node.destroy();
        }
    },
    onClickBtnCancel() {
        if (this._cancelCb) {
            this._cancelCb();
        }
        if (this.node) {
            this.node.destroy();
        }
    },
    onClickBtnClose() {
        if (this._closeCb) {
            this._closeCb();
        }
        this.node.destroy();
    },
})


