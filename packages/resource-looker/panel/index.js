let packageName = "resource-looker";
let fs = require('fire-fs');
let path = require('fire-path');
Editor.require(`packages://${packageName}/panel/result-item.js`)();

Editor.Panel.extend({
    style: fs.readFileSync(Editor.url(`packages://${packageName}/panel/index.css`), 'utf8'),
    template: fs.readFileSync(Editor.url(`packages://${packageName}/panel/index.html`), 'utf8'),


    $: {
        logTextArea: '#logTextArea',

    },

    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };


        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
            },
            init() {
            },
            data: {
                logView: "",
                findResName: "",
                resultArray: [
                    {
                        name: "name1",
                        path: "path1",
                    }
                ],
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },

                // 查找引用到的资源文件
                onBtnClickFindReference() {
                    console.log("1");
                    debugger
                    this.findResName;

                },
                onResNameChanged() {
                    console.log("2");
                },
                onBtnClickSelectSheet() {

                },
                dropFile(event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        console.log(file);
                    } else {
                        console.log("no file");
                    }
                },
                drag(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // console.log("dragOver");
                },

            }
        });
    },

    // register your ipc messages here
    messages: {
        'resource-looker:hello'(event) {
            this.$label.innerText = 'Hello!';
        }
    }
});