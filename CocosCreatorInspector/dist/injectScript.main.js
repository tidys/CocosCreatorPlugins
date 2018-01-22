/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 151);
/******/ })
/************************************************************************/
/******/ ({

/***/ 151:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
/* harmony default export */ __webpack_exports__["default"] = (function () {
  var msgType = {
    nodeInfo: 2, //节点信息
    nodeListInfo: 1, // 节点列表信息
    notSupport: 0 // 不支持的游戏
  };
  var postData = {
    scene: {
      name: "",
      children: []
    }
  };
  window.inspectorGameMemoryStorage = window.inspectorGameMemoryStorage || {};

  // 收集组件信息
  function getNodeComponentsInfo(node) {
    var ret = [];
    var nodeComp = node._components;
    for (var i = 0; i < nodeComp.length; i++) {
      var itemComp = nodeComp[i];
      window.inspectorGameMemoryStorage[itemComp.uuid] = itemComp;
      ret.push({
        uuid: itemComp.uuid,
        type: itemComp.constructor.name,
        name: itemComp.name
      });
    }
    return ret;
  }

  // 设置节点是否可视
  window.pluginSetNodeActive = function (uuid, isActive) {
    var node = window.inspectorGameMemoryStorage[uuid];
    if (node) {
      if (isActive === 1) {
        node.active = true;
      } else if (isActive === 0) {
        node.active = false;
      }
    }
  };
  // 获取节点信息
  window.getNodeInfo = function (uuid) {
    var node = window.inspectorGameMemoryStorage[uuid];
    if (node) {
      var nodeComp = getNodeComponentsInfo(node);
      var nodeData = {
        type: node.constructor.name,
        uuid: node.uuid,
        name: node.name,
        x: node.x,
        y: node.y,
        zIndex: node.zIndex,
        childrenCount: node.childrenCount,
        children: [],
        width: node.width,
        height: node.height,
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
      var nodeType = node.constructor.name;
      if (nodeType === 'cc_Scene') {} else {
        nodeData.active = node.active;
      }
      window.sendMsgToDevTools(msgType.nodeInfo, nodeData);
    } else {
      // 未获取到节点数据
      console.log("未获取到节点数据");
    }
  };

  // 收集节点信息
  function getNodeChildren(node, data) {
    // console.log("nodeName: " + node.name);
    var nodeData = {
      uuid: node.uuid,
      name: node.name,
      children: []
    };
    window.inspectorGameMemoryStorage[node.uuid] = node;
    var nodeChildren = node.getChildren();
    for (var i = 0; i < nodeChildren.length; i++) {
      var childItem = nodeChildren[i];
      // console.log("childName: " + childItem.name);
      getNodeChildren(childItem, nodeData.children);
    }
    data.push(nodeData);
  }

  window.sendMsgToDevTools = function (type, msg) {
    window.postMessage({ type: type, msg: msg }, "*");
  };
  // 检测是否包含cc变量
  var isCocosCreatorGame = true;
  try {
    var cocosInspectorTestVar = cc;
  } catch (e) {
    isCocosCreatorGame = false;
    window.sendMsgToDevTools(msgType.notSupport, "不支持调试游戏!");
  }

  if (isCocosCreatorGame) {
    var scene = cc.director.getScene();
    if (scene) {
      postData.scene = {
        type: 1, // 标识类型
        uuid: scene.uuid,
        name: scene.name,
        children: []
      };
      window.inspectorGameMemoryStorage[scene.uuid] = scene;

      var sceneChildren = scene.getChildren();
      for (var i = 0; i < sceneChildren.length; i++) {
        var node = sceneChildren[i];
        getNodeChildren(node, postData.scene.children);
      }
      // console.log(postData);
      window.sendMsgToDevTools(msgType.nodeListInfo, postData);
    } else {
      postData.scene = null;
      window.sendMsgToDevTools(msgType.notSupport, "不支持调试游戏!");
    }
  } else {
    console.log("未发现cocos creator game");
  }
});

/***/ })

/******/ });
//# sourceMappingURL=injectScript.main.js.map