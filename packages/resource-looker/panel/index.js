let packageName = "resource-looker";
let fs = require('fire-fs');
let path = require('fire-path');

Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",


    $: {
        logTextArea: '#logTextArea',

    },

    // method executed when template and styles are successfully loaded and initialized
    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };


        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
            },
            init() {
            },
            data: {
                logView: "",
                findResName: "",
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                onBtnClickFindReferenceRes() {
                    console.log("1");
                },
                onResNameChanged() {
                    console.log("2");
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