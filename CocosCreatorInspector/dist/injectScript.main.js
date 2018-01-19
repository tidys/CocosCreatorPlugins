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
// eval 注入脚本的代码,变量尽量使用var
/* harmony default export */ __webpack_exports__["default"] = (function () {
  ////////////////////////注入界面逻辑代码////////////////////////////////////////////
  function inspectorTimerUpdate() {
    var msgType = {
      nodeListInfo: 1, // 节点信息
      notSupport: 0 // 不支持的游戏
    };
    var postData = {
      scene: {
        "sceneName": {
          name: "",
          children: {
            // 节点的名字作为key
          }
        }
      }
    };

    // 收集节点信息
    function getNodeChildren(node, data) {
      var nodeName = node.name;
      // console.log("nodeName: " + nodeName);
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
        skewY: node.skewY
      };
      var nodeChildren = node.getChildren();
      for (var i = 0; i < nodeChildren.length; i++) {
        var childItem = nodeChildren[i];
        // let childName = childItem.name;
        // console.log("childName: " + childName);
        getNodeChildren(childItem, data[nodeName].children);
      }
    }

    function sendMsgToDevTools(type, msg) {
      window.postMessage({ type: type, msg: msg }, "*");
    }

    // 检测是否包含cc变量
    try {
      var cocosInspectorTestVar = cc;
    } catch (e) {
      sendMsgToDevTools(msgType.notSupport, "不支持调试游戏!");
      return;
    }

    var scene = cc.director.getScene();
    if (scene) {
      postData.scene = {};
      var sceneName = scene.name;
      postData.scene[sceneName] = {};
      postData.scene[sceneName].name = sceneName;
      postData.scene[sceneName].children = {};

      var sceneChildren = scene.getChildren();
      for (var i = 0; i < sceneChildren.length; i++) {
        var item = sceneChildren[i];
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
});

/***/ })

/******/ });
//# sourceMappingURL=injectScript.main.js.map