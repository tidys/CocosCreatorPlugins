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
/******/ 	return __webpack_require__(__webpack_require__.s = 182);
/******/ })
/************************************************************************/
/******/ ({

/***/ 182:
/***/ (function(module, exports) {

chrome.extension.onConnect.addListener(function (port) {
  console.log("backgroundScripts connect!");
  var extensionListener = function extensionListener(message, sender, sendResponse) {
    if (message.tabId && message.content) {
      if (message.action === 'code') {
        console.log("执行code");
        chrome.tabs.executeScript(message.tabId, { code: message.content });
      } else if (message.action === 'script') {
        console.log("执行script");
        chrome.tabs.executeScript(message.tabId, { file: message.content });
      } else {
        console.log("执行other");
        chrome.tabs.sendMessage(message.tabId, message, sendResponse);
      }
    } else {
      port.postMessage(message);
    }
    sendResponse(message);
  };
  chrome.extension.onMessage.addListener(extensionListener);
  port.onDisconnect.addListener(function (port) {
    chrome.extension.onMessage.removeListener(extensionListener);
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  return true;
});

/***/ })

/******/ });
//# sourceMappingURL=backgroundScripts.main.js.map