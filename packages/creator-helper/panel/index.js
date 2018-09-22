let fs = require('fire-fs');
let path = require('fire-path');
Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://creator-helper/panel/index.css'), 'utf-8'),
    template: fs.readFileSync(Editor.url('packages://creator-helper/panel/index.html'), 'utf-8'),

    $: {},

    ready() {
        window.creatyorHelper = new window.Vue({
            el: this.shadowRoot,
            created() {
                // Editor.Profile.load("profile://local/creator-helper.json", function (error, data) {
                //         if (!error) {
                //             console.log(data);
                //         } else {
                //         }
                //     }.bind(this)
                // );
                this.webUrl = this.defaultCfg.docs.url;
                this.curSelectUrl = this.webUrl;
            },
            data: {
                defaultCfg: {
                    docs: {name: "文档", url: "http://docs.cocos.com/creator/manual/zh/"},
                    forum: {name: "论坛", url: "http://forum.cocos.com/c/Creator"},
                    baidu: {name: "百度", url: "http://www.baidu.com"}
                },
                webUrl: "http://docs.cocos.com/creator/manual/zh/",
                curSelectUrl: '',
            },
            methods: {
                onChangeWebUrl(event) {
                    let url = event.currentTarget.$select.value;
                    if (url) {
                        this.webUrl = url;
                    }
                },
                _getWebView() {
                    return this.$els.web;
                },
                _initWebEvent() {
                    let web = this.$els.web;
                    if (web && !web.initEvent) {
                        console.log('init web event');
                        web.addEventListener('did-start-loading', function () {
                            // console.log('did-start-loading');
                        });
                        web.addEventListener('did-stop-loading', function () {
                            // console.log('did-stop-loading');
                        });
                        web.addEventListener('dom-ready', function () {
                            // console.log('dom-ready');
                            // web.openDevTools();
                        }.bind(this))
                    }
                },
                onBtnClickWebGoBack() {
                    this._initWebEvent();
                    let web = this._getWebView();
                    let d = web.goBack(function (a, b, c) {
                        console.log(a);
                        console.log(b);
                        console.log(c);
                    });
                    console.log(d);
                },
                onBtnClickWebForward() {
                    let d = this._getWebView().goForward();
                    console.log(d);
                },
                onBtnClickCollect() {

                },
                onInputWebUrlOver() {
                    let url = this.webUrl;
                    let isWebUrl = false;
                    if (isWebUrl === false) {
                        let index = this.webUrl.indexOf('http://');
                        if (index === -1) {
                            url = 'http://' + url;
                        } else {
                            isWebUrl = true;
                        }
                    }

                    if (isWebUrl === false) {
                        let index = this.webUrl.indexOf('https://');
                        if (index === -1) {
                            url = "https://" + url;
                        } else {
                            isWebUrl = true;
                        }
                    }

                    this.webUrl = url;
                    this.curSelectUrl = url;
                },
            }
        });

    },

    messages: {
        'creator-helper:hello'(event) {


        }
    }
});