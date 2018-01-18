module.exports = {
    // cc.require('InspectorScript').inspectorSupport();
    inspectorSupport() {
        let msgType = {
            nodeListInfo: 1,// 节点信息
            notSupport: 0,// 不支持的游戏
        };
        let postData = {
            scene: {
                "sceneName": {
                    name: "",
                    children: {
                        // 节点的名字作为key
                    }
                }
            },
        };

        // 收集节点信息
        function getNodeChildren(node, data) {
            let nodeName = node.name;
            console.log("nodeName: " + nodeName);
            data[nodeName] = {
                uuid: node.uuid,
                name: nodeName,
                x: node.x,
                y: node.y,
                zIndex: node.zIndex,
                childrenCount: node.childrenCount,
                children: {},
                width: node.width,
                height: node.height,
                active: node.active,
                color: node.color.toCSS(),
                opacity: node.opacity,
                rotation: node.rotation,
                rotationX: node.rotationX,
                rotationY: node.rotationY,
                anchorX: node.anchorX,
                anchorY: node.anchorY,
                scaleX: node.scaleX,
                scaleY: node.scaleY,
                skewX: node.skewX,
                skewY: node.skewY,
            };
            let nodeChildren = node.getChildren();
            for (let i = 0; i < nodeChildren.length; i++) {
                let childItem = nodeChildren[i];
                // let childName = childItem.name;
                // console.log("childName: " + childName);
                getNodeChildren(childItem, data[nodeName].children);
            }

        }

        function sendMsgToDevTools(type, msg) {
            window.postMessage({type: type, msg: msg}, "*");

        }

        let scene = cc.director.getScene();
        if (scene) {
            postData.scene = {};
            let sceneName = scene.name;
            postData.scene[sceneName] = {};
            postData.scene[sceneName].name = sceneName;
            postData.scene[sceneName].children = {};

            let sceneChildren = scene.getChildren();
            for (let i = 0; i < sceneChildren.length; i++) {
                let item = sceneChildren[i];
                getNodeChildren(item, postData.scene[sceneName].children);
            }

            // console.log(postData);
            sendMsgToDevTools(msgType.nodeListInfo, postData);
        } else {
            postData.scene = null;
            sendMsgToDevTools(msgType.notSupport, "不支持调试游戏!");
        }
    },

};