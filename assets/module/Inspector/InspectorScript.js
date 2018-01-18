module.exports = {
    // cc.require('InspectorScript').inspectorSupport();
    inspectorSupport() {
        let postData = {
            scene: {
                name: "",
                children: {
                    // 节点的名字作为key
                }
            },
        };

        function getNodeChildren(node, data) {
            let nodeName = node.name;
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
            let children = node.getChildren();
            for (let i = 0; i < children.length; i++) {
                let childItem = children[i];
                let childName = childItem.name;
                console.log("childName: " + childName);
                data[childName] = {
                    uuid: childItem.uuid,
                    name: childName,
                    x: childItem.x,
                    y: childItem.y,
                    zIndex: childItem.zIndex,
                    childrenCount: childItem.childrenCount,
                    children: {},
                    width: childItem.width,
                    height: childItem.height,
                    active: childItem.active,
                    color: childItem.color.toCSS(),
                    opacity: childItem.opacity,
                    rotation: childItem.rotation,
                    rotationX: childItem.rotationX,
                    rotationY: childItem.rotationY,
                    anchorX: childItem.anchorX,
                    anchorY: childItem.anchorY,
                    scaleX: childItem.scaleX,
                    scaleY: childItem.scaleY,
                    skewX: childItem.skewX,
                    skewY: childItem.skewY,
                };
                getNodeChildren(childItem, data[childName].children);
            }

        }

        let scene = cc.director.getScene();
        if (scene) {
            postData.scene.name = scene.name;
            getNodeChildren(scene, postData.scene);
            console.log(postData);
        } else {
            postData.scene = null;
        }
    },

};