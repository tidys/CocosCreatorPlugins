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
/******/ 	return __webpack_require__(__webpack_require__.s = 175);
/******/ })
/************************************************************************/
/******/ ({

/***/ 175:
/***/ (function(module, exports) {

// 检查游戏是否为cocos游戏
// var cc={};
// if (typeof cc === "undefined") {
//   console.log("该html不是cocos游戏,无法调试!");
//   chrome.devtools.panels.elements.createSidebarPane("Creator Properties", function (sidebar) {
//     // console.log("[Cocos Creator Inspector] CreateSidebarPane");
//     // sidebar.setObject({ some_data: "Some data to show" });
//     sidebar.setPage("devNoGame.html");
//   });
//   chrome.devtools.panels.create(
//     "Cocos",
//     "static/images/icon48.png",
//     "devNoGame.html", function (panel) {
//       // console.log("[Cocos Creator Inspector] Dev Panel Created!");
//     });
//
// } else {
//
// }
chrome.devtools.panels.elements.createSidebarPane('My SliderBar', function (sidebar) {
  sidebar.setObject({ some_data: "some data to show!" });
});

chrome.devtools.panels.create("Cocos", "static/images/icon48.png", "devInspector.html", function (panel) {
  console.log("[Cocos Creator Inspector] Dev Panel Created!");

  panel.onShown.addListener(function (window) {
    console.log("panel show");
  });
  panel.onHidden.addListener(function (window) {
    console.log("panel hide");
  });
  panel.onSearch.addListener(function (action, query) {
    console.log("panel search!");
    return false;
  });
});

// (function () {
//   var t = window.setInterval(function () {
//      egret && egret.devtool &&
//       egret.devtool.start &&
//       (window.clearInterval(t) || egret.devtool.start());
//     console.log("waiting")
//   }, 100);
//   egret && egret.devtool && egret.devtool.start && (window.clearInterval(t) || egret.devtool.start());
// })();

/***/ })

/******/ });
//# sourceMappingURL=dev.main.js.map