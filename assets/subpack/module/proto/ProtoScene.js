cc.Class({
    extends: cc.Component,

    properties: {},


    onLoad() {
    },

    start() {

    },
    onClickProto() {
        let proto = require("proto");
        let Test = proto.proto.Test;
        let sendData = {
            id: 1,
            name: "test",
        };
        let msg = Test.create(sendData);
        let buffer = Test.encode(msg).finish();


        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)) {
                let text = xhr.responseText;

            }
        }
        let url = "http://localhost:3210/";
        xhr.open("post", url, true);
        xhr.send(JSON.stringify(buffer));
    },

    // update (dt) {},
});
