const UUID = Editor.require("packages://hot-update-tools/node_modules/uuid/v4");
const {JSONStorage} = Editor.require("packages://hot-update-tools/node_modules/node-localstorage");
const UA = Editor.require("packages://hot-update-tools/node_modules/universal-analytics");
const {app} = require("electron").remote;
const Package = Editor.require("packages://hot-update-tools/package.json");

module.exports = {
    nodeStorage: null,
    user: null,

    init() {
        this.nodeStorage = new JSONStorage(app.getPath('userData'));
        const userId = this.nodeStorage.getItem("userId") || UUID();
        this.nodeStorage.setItem('userId', userId);
        this.user = UA("UA-134924925-1", userId);
    },
    event(event) {
        if (this.user) {
            this.user.event({
                ec: `${Package.name} : V${Package.version}`,// text 用户互动对象(video)
                ea: event || "",// text 用户互动类型(paly)
                el: "",// text 用于对事件进行分类
                ev: 0,// int 与事件相关的数值
            }).send();
        }
    },
    eventOpen() {
        this.event("open");
    },
    eventDoc() {
        this.event(`${Package.name}-doc`);
    },
    eventQQ() {
        this.event(`${Package.name}-qq`);
    },
    eventCustom(event) {
        this.event(event);
    },
}