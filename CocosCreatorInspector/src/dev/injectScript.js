// eval 注入脚本的代码,变量尽量使用var
export default function () {
  ////////////////////////注入界面逻辑代码////////////////////////////////////////////
  function inspectorTimerUpdate() {
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
      let uuid = node.uuid;
      // console.log("nodeName: " + nodeName);
      data[uuid] = {
        uuid: node.uuid,
        name: node.name,
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
        getNodeChildren(childItem, data[uuid].children);
      }

    }

    function sendMsgToDevTools(type, msg) {
      window.postMessage({type: type, msg: msg}, "*");
    }

    // 检测是否包含cc变量
    try {
      let cocosInspectorTestVar = cc;
    } catch (e) {
      sendMsgToDevTools(msgType.notSupport, "不支持调试游戏!");
      return;
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
  }


  inspectorTimerUpdate();

  // var inspectorRunCount = 0;
  // if (window.cocosCreatorInspectorTimer !== undefined) {
  //   clearInterval(window.cocosCreatorInspectorTimer);
  // }
  // window.cocosCreatorInspectorTimer = setInterval(inspectorTimerUpdate, 1000);
}
