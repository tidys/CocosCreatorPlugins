var FS = require("fire-fs");

Editor.Panel.extend({
    style: FS.readFileSync(Editor.url('packages://creator-chat-room/panel/index.css', 'utf8')) + "",
    template: FS.readFileSync(Editor.url('packages://creator-chat-room/panel/index.html', 'utf8')) + "",
    $: {},
    ready() {
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {

            },
            init() {

            },
            data: {
                word: "test word",
            },
            methods: {
                _checkFir(url) {
                    let xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && ((xhr.status >= 200 && xhr.status < 400))) {
                            let text = xhr.responseText;
                            let result = JSON.parse(text);
                            console.log(result);
                        }
                    };
                    xhr.open('GET', url, true);
                    xhr.send();
                },
                onTest() {
                    this._onDidi();
                    return;
                    console.log("test");
                    let url = "https://download.fir.im/game";
                    this._checkFir(url);
                    return;
                    let wildDog = Editor.require("packages://creator-chat-room/node_modules/wilddog");
                    let config = {
                        syncURL: "https://wild-hare-4781.wilddogio.com" //输入节点 URL
                    };
                    wildDog.initializeApp(config);
                    let ref = wildDog.sync().ref();
                    ref.on('value', function (snapshot) {
                        let str = snapshot.val();
                        this.word = str;
                        console.log(str);
                    }.bind(this));

                },

                // 转码
                toChar(str) {
                    if (str.substr(0, 2) !== "\\u") return str;
                    let code = 0;
                    for (let i = 2; i < str.length; i++) {
                        let cc = str.charCodeAt(i);
                        if (cc >= 0x30 && cc <= 0x39)
                            cc = cc - 0x30;
                        else if (cc >= 0x41 && cc <= 0x5A)
                            cc = cc - 0x41 + 10;
                        else if (cc >= 0x61 && cc <= 0x7A)
                            cc = cc - 0x61 + 10;

                        code <<= 4;
                        code += cc;
                    }
                    if (code < 0xff) return str;
                    return String.fromCharCode(code);
                },

                ascii2native(strAscii) {
                    let output = "";
                    let posFrom = 0;
                    let posTo = strAscii.indexOf("\\u", posFrom);
                    while (posTo >= 0) {
                        output += strAscii.substring(posFrom, posTo);
                        output += this.toChar(strAscii.substr(posTo, 6));
                        posFrom = posTo + 6;
                        posTo = strAscii.indexOf("\\u", posFrom);
                    }
                    output += strAscii.substr(posFrom);
                    return output;
                },

                _onDidi() {
                    let url = "https://gsactivity.diditaxi.com.cn/gulfstream/activity/v2/giftpackage/open" +
                        "?channel=edec35901f164a2cf7989c51edad2ac7" +
                        "&tsp=1520068452" +
                        "&sign=4207937C95F67A833F2391A5569B39F0" +
                        "&code=" +
                        "&phone=15514573068" +
                        "&lang=zh-CN";
                    let xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && ((xhr.status >= 200 && xhr.status < 400))) {
                            let text = this.ascii2native(xhr.responseText);
                            console.log("\n" + text);
                            let json = null;
                            try {
                                json = JSON.parse(text);
                            } catch (e) {
                                console.log(e);
                            }
                        } else if (xhr.status === 404) {
                            // console.log("404");
                        }
                    }.bind(this);
                    xhr.open("GET", url);
                    xhr.send();
                },
            },
        });
    },

    messages: {
        'creator-chat-room:hello'(event) {
        }
    }
});