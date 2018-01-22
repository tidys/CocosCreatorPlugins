// eval 注入脚本的代码,变量尽量使用var
export default function () {
  var msgType = {
    nodeInfo: 2,//节点信息
    nodeListInfo: 1,// 节点列表信息
    notSupport: 0,// 不支持的游戏
  };
  var postData = {
    scene: {
      name: "",
      children: []
    },
  };
  window.inspectorGameMemoryStorage = window.inspectorGameMemoryStorage || {};

  // 收集组件信息
  function getNodeComponentsInfo(node) {
    let ret = [];
    let nodeComp = node._components;
    for (let i = 0; i < nodeComp.length; i++) {
      let itemComp = nodeComp[i];
      window.inspectorGameMemoryStorage[itemComp.uuid] = itemComp;
      ret.push({
        uuid: itemComp.uuid,
        type: itemComp.constructor.name,
        name: itemComp.name,
      });
    }
    return ret;
  }

  // 获取节点信息
  window.getNodeInfo = function (uuid) {
    let node = window.inspectorGameMemoryStorage[uuid];
    if (node) {
      let nodeComp = getNodeComponentsInfo(node);
      let nodeData = {
        uuid: node.uuid,
        name: node.name,
        x: node.x,
        y: node.y,
        zIndex: node.zIndex,
        childrenCount: node.childrenCount,
        children: [],
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
        components: nodeComp
      };
      let str = JSON.stringify(nodeData);
      console.log("node:\n" + str);
      window.sendMsgToDevTools(msgType.nodeListInfo, nodeData);
    } else {
      // 未获取到节点数据
      console.log("未获取到节点数据");
    }
  };

  // 收集节点信息
  function getNodeChildren(node, data) {
    // console.log("nodeName: " + node.name);
    let nodeData = {
      uuid: node.uuid,
      name: node.name,
      children: [],
    };
    window.inspectorGameMemoryStorage[node.uuid] = node;
    let nodeChildren = node.getChildren();
    for (let i = 0; i < nodeChildren.length; i++) {
      let childItem = nodeChildren[i];
      // console.log("childName: " + childItem.name);
      getNodeChildren(childItem, nodeData.children);
    }
    data.push(nodeData);
  }

  window.sendMsgToDevTools = function (type, msg) {
    console.log("post msg");
    window.postMessage({type: type, msg: msg}, "*");
  };

  // 检测是否包含cc变量
  try {
    let cocosInspectorTestVar = cc;
  } catch (e) {
    window.sendMsgToDevTools(msgType.notSupport, "不支持调试游戏!");
    return;
  }

  let scene = cc.director.getScene();
  if (scene) {
    postData.scene = {
      type: 1,// 标识类型
      uuid: scene.uuid,
      name: scene.name,
      children: [],
    };
    window.inspectorGameMemoryStorage[scene.uuid] = scene;

    let sceneChildren = scene.getChildren();
    for (let i = 0; i < sceneChildren.length; i++) {
      let node = sceneChildren[i];
      getNodeChildren(node, postData.scene.children);
    }
    console.log(postData);
    window.sendMsgToDevTools(msgType.nodeListInfo, postData);
  } else {
    postData.scene = null;
    window.sendMsgToDevTools(msgType.notSupport, "不支持调试游戏!");
  }
}
