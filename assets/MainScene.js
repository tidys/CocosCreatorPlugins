// 因为引入子包,所以,打包时启动成就也就必须设置为该scene了
cc.Class({
    extends: cc.Component,

    properties: {
        f:cc.Prefab,
    },


    onLoad() {

    },

    start() {
        if (CC_BUILD) {
            console.log("build 环境");
            this._loadSubPackages(['subpack'], function () {
                this.completion();
            }.bind(this));
        } else {
            console.log("dev 环境");
            this.completion();
        }

    },
    _loadSubPackages(subs, cb) {
        let loadFunc = function (sub, cb) {
            cc.loader.downloader.loadSubpackage(sub, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log('load "' + sub + '" successfully.');

                if (subs.length === 0) {
                    cb && cb();
                } else {
                    loadFunc(subs.shift(), cb);
                }
            });
        }
        loadFunc(subs.shift(), cb);
    },
    completion() {
        cc.director.preloadScene("ImageEncryption", function () {
            cc.director.loadScene("ImageEncryption");
        });
    }
    // update (dt) {},
});
