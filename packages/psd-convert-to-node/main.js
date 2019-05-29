"use strict";
let Util = require("util");
let Fs = require("fire-fs");
module.exports = {
    load() {
        Editor.warn("load psd-convert-to-node");
    },
    unload() {
        Editor.warn("unload psd-convert-to-node");
    },
    loadPsdFileByPath(ev, reverse, isSaveJson, layoutPath, pngFolder) {
        let list = [];
        this.saveScene(list, reverse, layoutPath, pngFolder);
        if (ev.reply) {
            ev.reply("ok");
        }
    },
    saveScene(list, reverse, layoutPath, pngFolder) {
        Editor.Ipc.sendToPanel("psd-convert-to-node", "get-mount-node-name", nodeName => {
            Editor.log("nodeName：", nodeName);
            Editor.Scene.callSceneScript("psd-convert-to-node", "create-psd-node", [list, nodeName, reverse, layoutPath, pngFolder], function (err, length) {
                // console.log(`create-psd-node callback :  length - ${length}`);
            }, () => {
                Editor.Ipc.sendToPanel("scene", "scene:stash-and-save");

                Editor.success("シーン保存成功");
            });
        });
    },
    parseTreeObj(treeObj) {
        let list = [];
        // Editor.warn('treeObj.children:', typeof treeObj);
        if (treeObj.children) {
            treeObj.children.forEach(node => {
                this.parseNode(node, list);
            });
        }

        Editor.warn("list:", list);
        return list;
    },
    parseNode(node, list) {
        let children = [];
        // Editor.log(node);
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                let childList = [];
                if (child.children && child.children.length > 0) {
                    // this.parseNode(child, childList);
                    this.parseNode(child, children);
                }
                else {
                    children.push({name: child.name, children: childList});
                }
            });
        }
        list.push({name: node.name, children: children});
    },
    messages: {
        "convert-psd-file"(ev, args) {
            this.loadPsdFileByPath(ev, args[0], args[1], args[2], args[3]);
        },
        "handler-psd-file"(ev, arrayBuffer) {

            Editor.success("psd-convert-to-node handler-psd-file:", arrayBuffer);
            this.loadPsdFile(arrayBuffer);
        },

        "open-panel"() {

            Editor.Panel.open("psd-convert-to-node");
        }
    }
};
//# sourceMappingURL=main.js.map
