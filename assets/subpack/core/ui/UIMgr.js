module.exports = {
    _uiMap: {},
    /*
    * 使用实例:
    * UIMgr.createPrefab(this.userInfoLayer, function (root, ui) {
            this.uiNode.addChild(root);
        }.bind(this));
    * */
    createPrefab(UIPrefab, createCallBack) {
        if (!UIPrefab) {
            console.log("[UIMgr] 无法创建Prefab: " + UIPrefab);
            return;
        }
        cc.loader.loadRes("prefab/uiMask/ComUIBg", function (err, prefab) {
            if (err) {
                console.log(err.errorMessage);
                return;
            }
            let nodeBg = cc.instantiate(prefab);
            let scriptBg = nodeBg.getComponent('ComUIBg');
            if (scriptBg) {
                let uiNode = scriptBg.addUI(UIPrefab);
                let uuid = uiNode.uuid.toString();
                // console.log("add uuid: " + uuid);
                this._uiMap[uuid] = nodeBg;
                if (createCallBack) {
                    createCallBack(nodeBg, uiNode);
                }
            }
        }.bind(this));
    },
    /*
    * 使用实例:
    * UIMgr.createPrefabAddToRunningScene(this.userInfoLayer, function (ui) {
            // ui 为实例化Prefab
        }.bind(this));
    * */
    createPrefabAddToRunningScene(UIPrefab, createCallBack) {
        if (!UIPrefab) {
            console.log("[UIMgr] 无法创建Prefab: " + UIPrefab);
            return;
        }
        cc.loader.loadRes("prefab/uiMask/ComUIBg", function (err, prefab) {
            let nodeBg = cc.instantiate(prefab);
            let scriptBg = nodeBg.getComponent('ComUIBg');
            if (scriptBg) {
                let uiNode = scriptBg.addUI(UIPrefab);
                let uuid = uiNode.uuid.toString();
                // console.log("add uuid: " + uuid);
                this._uiMap[uuid] = nodeBg;
                let scene = cc.director.getScene();
                if (scene) {
                    let w = cc.view.getVisibleSize().width;
                    let h = cc.view.getVisibleSize().height;
                    nodeBg.x = w / 2;
                    nodeBg.y = h / 2;
                    scene.addChild(nodeBg);

                    if (createCallBack) {
                        createCallBack(uiNode);
                    }
                } else {
                    console.log("[UIMgr] 没有运行Scene,无法添加UI界面!");
                }
            }
        }.bind(this));
    },

    destroyUI(script) {
        //节点被销毁  添加返回音效
        if (script) {
            if (script.node) {
                let uuid = script.node.uuid.toString();
                // console.log('destroy uuid: ' + uuid);
                let rootNode = this._uiMap[uuid];
                if (rootNode) {
                    rootNode.destroy();
                    this._uiMap[script.uuid.toString()] = null;
                } else {
                    console.log("[UIMgr]界面不是UIMgr创建的,无法销毁:" + script.node.name);
                }
            } else {
                console.log("[UIMgr] " + script.name + " 没有node属性");
            }
        } else {
            console.log("[UIMgr] 缺少参数");
        }
    },
};