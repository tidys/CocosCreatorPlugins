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
            },
        });
    },

    messages: {
        'creator-chat-room:hello'(event) {
        }
    }
});