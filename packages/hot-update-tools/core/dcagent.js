(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.DCAgent = {});
})(this, function (exports) {
  'use strict';

  var onlineTimer = {
    get reset() {
      return reset;
    },
    get cancel() {
      return cancel;
    },
    get stop() {
      return stop;
    },
    get run() {
      return run;
    },
    get set() {
      return set;
    }
  };

  var utils = {
    get isDebug() {
      return isDebug;
    },
    get noop() {
      return noop;
    },
    get isFunction() {
      return isFunction;
    },
    get isObject() {
      return isObject;
    },
    get log() {
      return log;
    },
    get tryThrow() {
      return tryThrow;
    },
    get uuid() {
      return uuid;
    },
    get extend() {
      return extend;
    },
    get attempt() {
      return attempt;
    },
    get isLocalStorageSupported() {
      return isLocalStorageSupported;
    },
    get repeat() {
      return repeat;
    },
    get padding() {
      return padding;
    },
    get aspect() {
      return aspect;
    },
    get getHostName() {
      return getHostName;
    },
    get hiddenProperty() {
      return hiddenProperty;
    },
    get slice() {
      return slice;
    },
    get parseInt() {
      return _parseInt;
    },
    get max() {
      return max;
    },
    get jsonStringify() {
      return jsonStringify;
    },
    get jsonParse() {
      return jsonParse;
    }
  };

  var dataCenter = {
    get getOnlineInfo() {
      return getOnlineInfo;
    },
    get collect() {
      return collect;
    },
    get clear() {
      return clear;
    },
    get saveToStorage() {
      return saveToStorage;
    },
    get loadFromStorage() {
      return loadFromStorage;
    },
    get addError() {
      return addError;
    },
    get addEvent() {
      return addEvent;
    }
  };

  var defaults = {
    get REQUEST_TIME_OUT() {
      return REQUEST_TIME_OUT;
    },
    get MAX_ONLINE_TIME() {
      return MAX_ONLINE_TIME;
    },
    get MIN_ONLINE_INTERVAL() {
      return MIN_ONLINE_INTERVAL;
    },
    get UID_MIN_LENGTH() {
      return UID_MIN_LENGTH;
    },
    get ASAP_TIMEOUT() {
      return ASAP_TIMEOUT;
    },
    get MAX_ERROR_COUNT() {
      return MAX_ERROR_COUNT;
    },
    get DEFAULT_AGE() {
      return DEFAULT_AGE;
    },
    get DEFAULT_GENDER() {
      return DEFAULT_GENDER;
    },
    get DEFAULT_ROLE_LEVEL() {
      return DEFAULT_ROLE_LEVEL;
    },
    get DEFAULT_NET_TYPE() {
      return DEFAULT_NET_TYPE;
    },
    get DEFAULT_PLATFORM() {
      return DEFAULT_PLATFORM;
    }
  };

  var CONST = {
    get HOST() {
      return HOST;
    },
    get CREATE_TIME() {
      return CREATE_TIME;
    },
    get EGRET_PREFIX() {
      return EGRET_PREFIX;
    },
    get LAYA_PREFIX() {
      return LAYA_PREFIX;
    },
    get COCOS_PREFIX() {
      return COCOS_PREFIX;
    },
    get UNKNOW_ENGINE() {
      return UNKNOW_ENGINE;
    },
    get PARENT_KEY() {
      return PARENT_KEY;
    },
    get EVENTS_KEY() {
      return EVENTS_KEY;
    },
    get ERRORS_KEY() {
      return ERRORS_KEY;
    },
    get CLIENT_KEY() {
      return CLIENT_KEY;
    },
    get QUIT_SNAPSHOT() {
      return QUIT_SNAPSHOT;
    },
    get LOGOUT_TIME() {
      return LOGOUT_TIME;
    },
    get API_PATH() {
      return _API_PATH;
    },
    get PADDING_STRING() {
      return PADDING_STRING;
    },
    get REQ_KEY() {
      return REQ_KEY;
    },
    get USER_INIT_BASE_SETTINGS() {
      return USER_INIT_BASE_SETTINGS;
    },
    get ACCOUNT_RELATED_SETTINGS() {
      return ACCOUNT_RELATED_SETTINGS;
    },
    get ACCOUNT_ROLE_SETTINGS() {
      return ACCOUNT_ROLE_SETTINGS;
    },
    get EVT_COIN() {
      return EVT_COIN;
    },
    get EVT_ITEM() {
      return EVT_ITEM;
    },
    get EVT_LEVEL() {
      return EVT_LEVEL;
    },
    get EVT_MISSION() {
      return EVT_MISSION;
    },
    get EVT_TASK() {
      return EVT_TASK;
    },
    get EVT_PV() {
      return EVT_PV;
    }
  };

  var storage = {
    get setUID() {
      return setUID;
    },
    get getUID() {
      return _getUID;
    },
    get setItem() {
      return setItem;
    },
    get getItem() {
      return getItem;
    },
    get removeItem() {
      return removeItem;
    }
  };

  var Client = {
    get hasStorage() {
      return hasStorage;
    },
    get isStandardBrowser() {
      return isStandardBrowser;
    },
    get hasCookie() {
      return hasCookie;
    },
    get protocol() {
      return protocol;
    },
    get useXDR() {
      return useXDR;
    },
    get device() {
      return device;
    }
  };

  var validator = {
    get isParamsValid() {
      return isParamsValid;
    },
    get shouldBeInited() {
      return shouldBeInited;
    },
    get shouldBeLoggedIn() {
      return shouldBeLoggedIn;
    },
    get shouldNotBeDestoryed() {
      return shouldNotBeDestoryed;
    }
  };

  var uri = {
    get API_PATH() {
      return API_PATH;
    },
    get appendOnline() {
      return appendOnline;
    },
    get appendEcho() {
      return appendEcho;
    }
  };

  var controller = {
    get setPollingDebounce() {
      return setPollingDebounce;
    }
  };

  var Engine = {
    get engine() {
      return engine;
    },
    get 'default'() {
      return detectEngine;
    }
  };

  var timer;

  /**
   * SDK内部状态管理
   */

  var stateCenter = {
    inited: false
  };

  /**
   * SDK内部使用的顶层对象及其主要对象
   * 不同环境下区别很大
   * 比如白鹭引擎真正的顶层对象是__global，但是window也不为空
   * 所以这里要抛弃针对网页属性检测的一些传统方案
   */

  // avoid bad invocation
  /*jshint -W067*/
  // 严格模式获取顶层对象
  // http://stackoverflow.com/questions/9642491/getting-a-reference-to-the-global-object-in-an-unknown-environment-in-strict-mod
  var topThis = (1, eval)('this');

  /*jshint +W067*/

  var window = topThis || {};

  var setTimeout = window.setTimeout;
  var clearTimeout = window.clearTimeout;

  var engine = {
    isEgret: !!window.egret,
    isLayabox: !!window.layabox,
    isCocos: !!window.cc && !!window.cc.game
  };

  /**
   * egret 参数略有不同
   * egret.setTimeout貌似有bug，优先使用全局默认的setTimeout
   */
  if (engine.isEgret && !setTimeout) {
    setTimeout = function (func, time) {
      window.egret.setTimeout(func, window, time);
    };

    clearTimeout = function (id) {
      window.egret.clearTimeout(id);
    };
  }

  var toString = Object.prototype.toString;

  var isDebug = window.DCAGENT_DEBUG_OPEN;

  /*
   * 不做任何操作的空函数，用于各种兼容处理
   */
  function noop() {}

  function isFunction(fn) {
    return typeof fn === 'function';
  }

  // plain object, no Array, dom, function
  function isObject(value) {
    return value && toString.call(value) === '[object Object]';
  }

  function log(msg) {
    console.log('---- DCAgent log start ----\n' + msg + '\n---- DCAgent log end   ----');
  }

  /**
   * debug环境抛错，正式环境打印日志
   */
  var tryThrow = isDebug ? function (msg) {
    throw new Error(msg);
  } : function (msg) {
    log(msg);
  };

  /**
   * generate a fake UUID
   * demo on http://jsfiddle.net/briguy37/2MVFd/
   * from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
   *
   * @returns {string}
   */
  function uuid(prefix) {
    var d, formatter, uid;
    d = Date.now();
    formatter = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    uid = formatter.replace(/[xy]/g, function (c) {
      var r;
      r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      if (c === 'x') {
        return r.toString(16);
      } else {
        return (r & 0x7 | 0x8).toString(16);
      }
    });

    return (prefix || '') + uid.replace(/-/g, '').toUpperCase();
  }

  /*
   * 扩展目标对象，只支持表单post的一级扩展
   * extend({}, {a: 1}, {b: 2})
   */
  function extend(target) {
    var key, val;
    for (key in target) {
      val = target[key];
      target[key] = val;
    }

    var params = arguments.length >= 2 ? [].slice.call(arguments, 1) : [];
    params.forEach(function (param) {
      var _results;
      _results = [];
      for (key in param) {
        val = param[key];
        _results.push(target[key] = val);
      }

      return _results;
    });

    return target;
  }

  /**
   * 安全执行函数
   * debug环境需要跑出错误不能catch，否则测试通不过
   */
  var attempt = isDebug ? function (fn, context, args) {
    if (!isFunction(fn)) return;

    return fn.apply(context, args);
  } : function (fn, context, args) {
    if (!isFunction(fn)) return;

    try {
      return fn.apply(context, args);
    } catch (e) {
      log('exec error for function:\n ' + fn.toString());
    }
  };

  /**
   * 测试是否真的支持本地存储，safari无痕模式会报异常
   * http://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an
   *
   * 测试本地存储quota https://arty.name/localstorage.html
   */
  function isLocalStorageSupported(storage) {
    return attempt(function () {
      // node里面 .表示当前目录，设置的时候会报错
      var key = '0';
      storage.setItem(key, key);
      var isSupport = storage.getItem(key) === key;
      storage.removeItem(key);
      return isSupport;
    });
  }

  /**
   * 重复某个字符串N次
   */
  function repeat(str) {
    var len = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    var ret = '';
    for (var i = 0; i < len; i += 1) {
      ret += str;
    }

    return ret;
  }

  /**
   * 补齐字符串到指定最小长度
   */
  function padding(original, paddingStr, len) {
    if (!original) return original;

    if (original && original.length >= len) return original;

    return original + repeat(paddingStr, Math.ceil(len - original.length) / paddingStr.length);
  }

  /**
   * AOP切面编程功能
   * @param func 原函数
   * @param before 前置函数
   * @param after 后置函数
   * @returns {Function} 返回函数的执行结果为原函数的执行结果
   */
  function aspect(func, before, after) {
    return function () {
      if (!Array.isArray(before)) {
        before = [before];
      }

      if (!Array.isArray(after)) {
        after = [after];
      }

      var i, fn;
      for (i = 0; i < before.length; i += 1) {
        fn = before[i];
        // 前置函数返回false表示提前结束执行
        if (attempt(fn, this, arguments) === false) return;
      }

      var result = attempt(func, this, arguments);

      // 主函数返回false表示中断后置函数执行
      if (result === false) return false;

      for (i = 0; i < after.length; i += 1) {
        fn = after[i];
        attempt(fn, this, arguments);
      }

      return result;
    };
  }

  /**
   * http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
   */
  function getHostName(href) {
    if (!href) return '';

    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match ? match[3] : '';
  }

  var document = topThis.document || {};

  var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : 'msHidden' in document ? 'msHidden' : null;

  function slice(args, start, end) {
    return [].slice.call(args, start, end);
  }

  function _parseInt(value) {
    var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var radix = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];

    // 大于21位长度会转换为 1e21的字符串
    if (value >= 1e21) {
      value = 9527e16;
    }

    return window.parseInt(value, radix) || defaultValue;
  }

  function max(num) {
    return Math.min(9.9e20, num);
  }

  function jsonStringify(data) {
    try {
      return data ? JSON.stringify(data) : null;
    } catch (e) {
      log('invalid json format');
    }

    return null;
  }

  function jsonParse(str) {
    try {
      return str ? JSON.parse(str) : null;
    } catch (e) {
      log('invalid json string');
    }

    return null;
  }

  function Timer(fn, duration) {
    var _this = this;

    /**
     * running期间多次调用会执行多次
     * 下个执行点为轮询执行完毕的duration之后
     */
    this.duration = duration;
    this.status = 'running';
    this.timer = setTimeout(function () {
      return _this.run();
    }, this.duration);

    // 立即执行一次函数
    this.run = function () {
      if (_this.status === 'cancelled') return;

      // 清除上次的定时器
      clearTimeout(_this.timer);

      utils.attempt(fn);

      _this.timer = setTimeout(function () {
        return _this.run();
      }, _this.duration);
    };

    this.stop = function () {
      _this.status = 'stopped';
      clearTimeout(_this.timer);
    };

    // reset之后也会立即执行一次
    this.reset = function (num) {
      if (_this.status === 'cancelled') return;

      _this.stop();
      if (num) {
        _this.duration = num;
      }
      _this.run();
    };

    // 永久停止timer防止被错误启动
    this.cancel = function () {
      this.status = 'cancelled';
      clearTimeout(this.timer);
    };
  }

  /**
   * 等待一个周期再启动Timer
   */
  function reset(interval) {
    if (timer) {
      timer.stop();
      setTimeout(function () {
        timer && timer.reset(interval);
      }, interval);

      if (interval) {
        stateCenter.interval = interval;
      }
    }
  }

  /**
   * 停止定时器上报
   */
  function cancel() {
    if (timer) {
      timer.cancel();
      timer = null;
    }
  }

  function stop() {
    if (timer) {
      timer.stop();
    }
  }

  function run() {
    if (timer) {
      timer.run();
    }
  }

  function set(func, interval) {
    timer = new Timer(func, interval);
  }

  // 错误信息
  var errors = [];

  // 当前页面使用的引擎
  var engineName;

  // SDK若在引擎之前加载，开始获取到的引擎名称可能为空。所以要多尝试几次
  var retryTimes = 0;

  /**
   * 获取当前引擎名称
   */
  function detectEngine() {
    if (engineName) return engineName;

    retryTimes += 1;
    if (retryTimes > 4) return;

    // egret和layabox在supports已经检测直接使用
    var engines = {
      egret: 'egret',
      layabox: 'layabox',
      // http://www.cocos2d-x.org/reference/html5-js/V3.6/index.html
      cocos: 'cc.game',
      impact: 'ig',
      phaser: 'Phaser',
      pixi: 'PIXI',
      create: 'createjs',
      three: 'THREE',
      gameMaker: 'asset_get_type',
      playCanvas: 'pc.fw',
      // http://biz.turbulenz.com/sample_assets/2dcanvas.js.html
      turbulenz: 'TurbulenzEngine',
      // http://www.html5quintus.com/#demo
      quintus: 'Quintus',
      // https://github.com/melonjs/melonJS
      melon: 'me.game',
      // https://github.com/LazerUnicorns/lycheeJS
      lychee: 'lychee',
      // http://www.clockworkchilli.com/index.php/developers/snippet/1
      wade: 'wade.addSceneObject',
      // http://craftyjs.com/
      crafty: 'Crafty',
      // https://github.com/digitalfruit/limejs
      lime: 'lime.Scene',
      // https://github.com/wise9/enchant.js
      enchant: 'enchant',
      // http://www.isogenicengine.com/docs-reference.html#IgeEngine
      isogenic: 'IgeEngine',
      // http://docs.gameclosure.com/example/advrendering-tiles/index.html
      gameclosure: 'GC.Application',
      // http://www.pandajs.net/docs/files/src_engine_scene.js.html#l11
      panda: 'game.Scene',
      // http://www.api.kiwijs.org/
      kiwi: 'Kiwi',
      // https://github.com/ippa/jaws
      jaws: 'jaws',
      // http://sirius2d.com/doc/
      sirius2d: 'ss2d',
      // http://jindo.dev.naver.com/collie/doc/index.html?l=en
      collie: 'collie',
      // https://github.com/wellcaffeinated/PhysicsJS/
      physics: 'Physics',
      // https://github.com/piqnt/stage.js
      stage: 'Stage.Anim',
      // https://github.com/BabylonJS/Babylon.js
      babylon: 'BABYLON'
    };

    for (var key in engines) {
      var namespace = engines[key];

      // 有些引擎的namespace过于通用会进行一次深度属性检测
      if (namespace.indexOf('.') > -1) {
        var props = namespace.split('.');
        var field = window[props[0]];

        if (field && field[props[1]]) {
          engineName = key;
          return key;
        }
      } else {
        if (window[namespace]) {
          engineName = key;
          return key;
        }
      }
    }
  }

  exports.version = 27;

  // 上报超时时间
  var REQUEST_TIME_OUT = 30 * 1000;

  // 最大在线时长为两天
  var MAX_ONLINE_TIME = 3600 * 24 * 2;

  // 最短在线轮询周期，秒
  var MIN_ONLINE_INTERVAL = 40;

  var UID_MIN_LENGTH = 32;

  // 尽早执行的定时器的延时
  var ASAP_TIMEOUT = 5000;

  // 最大错误上报数目
  var MAX_ERROR_COUNT = 100;

  var DEFAULT_AGE = 0;

  var DEFAULT_GENDER = 0;

  var DEFAULT_ROLE_LEVEL = 0;

  var DEFAULT_NET_TYPE = 3;

  var DEFAULT_PLATFORM = 0;

  var config = {
    accountId: '',
    accountType: '',
    age: defaults.DEFAULT_AGE,
    appId: '',
    appVersion: '',
    brand: '',
    channel: '',
    customDeviceId: '',
    gameServer: '',
    gender: defaults.DEFAULT_GENDER,
    idfa: '',
    imei: '',
    lonLat: '',
    mac: '',
    netType: defaults.DEFAULT_NET_TYPE,
    operator: '',
    osVersion: '',
    platform: defaults.DEFAULT_PLATFORM,
    resolution: '',
    roleClass: '',
    roleId: '',
    roleLevel: defaults.DEFAULT_ROLE_LEVEL,
    roleRace: '',
    simCardOp: '',
    uid: '',
    ver: exports.version
  };

  // 自定义事件信息
  var events = [];

  // 已上报错误数
  var totalError = 0;

  var platform = defaults.DEFAULT_PLATFORM;

  var screenObj = window.screen || {};

  var resolution = screenObj.width && screenObj.width + '*' + screenObj.height;

  // 未知分辨率
  var unknownWH = '0*0';

  if (!resolution) {
    resolution = unknownWH;
  }

  var osVersion = '';

  /**
   * 如果运行环境不是浏览器
   * 需要SDK初始化时指定brand，osVersion，platform
   */
  var brand = '';

  var userAgent = window.navigator && window.navigator.userAgent || '';

  if (!userAgent) {
    var platforms = ['ios', 'android'];

    if (engine.layabox) {
      var deviceInfo = window.layabox.getDeviceInfo() || {};
      resolution = deviceInfo.resolution || unknownWH;
      brand = deviceInfo.phonemodel;
      platform = platforms.indexOf(deviceInfo.os.toLowerCase());
      osVersion = (deviceInfo.os + ' ' + deviceInfo.osversion).toLowerCase();
    } else if (engine.cocos) {
      var rect = window.cc.view.getViewPortRect() || {};
      resolution = rect.width + '*' + rect.height;
      platform = platforms.indexOf(window.cc.sys.os.toLowerCase());
      // brand和os version也无法取得
    }

    // 未知平台
    if ([0, 1, 2, 3].indexOf(platform) === -1) {
      platform = defaults.DEFAULT_PLATFORM;
    }
  }

  var device = { resolution: resolution, brand: brand, osVersion: osVersion, platform: platform };

  for (var key in device) {
    // 优先使用用户配置
    config[key] = config[key] || device[key];
  }

  function getOnlineInfo() {
    var loginTime = stateCenter.loginTime || stateCenter.initTime;
    return {
      loginTime: loginTime,
      onlineTime: utils.parseInt(Date.now() / 1000) - loginTime || 1,
      extendMap: {
        // 流量来源
        from: stateCenter.from,
        // 引擎类型
        engine: detectEngine() || '',
        // 应用名称
        app: stateCenter.app
      }
    };
  }

  /**
   * 搜集本次上报数据
   */
  function collect(payment, reg) {
    var payload = {
      headerInfo: config,
      onlineInfo: getOnlineInfo(),
      // 复制一份防止被清
      errorInfoList: errors.concat(),
      eventInfoList: events.concat()
    };

    if (payment) {
      payload.paymentInfo = payment;
    }

    if (reg) {
      payload.userInfo = reg;
    }

    return payload;
  }

  function clear() {
    events.length = 0;
    errors.length = 0;
  }

  var HOST = 'rd.gdatacube.net';

  var CREATE_TIME = 'dcagent_create_time';

  var EGRET_PREFIX = 'EGRET';

  var LAYA_PREFIX = 'LAYA';

  var COCOS_PREFIX = 'COCOS';

  // 未知引擎
  var UNKNOW_ENGINE = 'UE';

  var PARENT_KEY = 'dcagent_parent_id';

  var EVENTS_KEY = 'dcagent_client_events';

  var ERRORS_KEY = 'dcagent_client_errors';

  var CLIENT_KEY = 'dcagent_client_id';

  // 用户退出时数据存储到本地
  var QUIT_SNAPSHOT = 'dcagent_snapshot';

  var LOGOUT_TIME = 'dc_p_lo';

  var _API_PATH = '/dc/hh5/sync';

  var PADDING_STRING = '0A';

  /**
   * 自定义事件类型，上报请求耗时
   */
  var REQ_KEY = 'DE_EVENT_OSS';

  // SDK初始化设置字段
  // accountId无法在此设置，需要主动调用login接口
  var USER_INIT_BASE_SETTINGS = 'appId,appVersion,brand,channel,customDeviceId,idfa,imei,lonLat,mac,netType,operator,osVersion,platform,simCardOp,uid';

  // 玩家属性，在切换用户时需要重置
  var ACCOUNT_RELATED_SETTINGS = 'accountId,accountType,age,gender,gameServer';

  // 玩家角色相关属性，，在切换用户时需要重置
  var ACCOUNT_ROLE_SETTINGS = 'roleId,roleRace,roleClass,roleLevel';

  var EVT_COIN = 'DE_EVENT_COIN_ACTION';

  var EVT_ITEM = 'DE_EVENT_ITEM_ACTION';

  var EVT_LEVEL = 'DE_EVENT_LEVELUP';

  var EVT_MISSION = 'DE_EVENT_GUANKA_ACTION';

  var EVT_TASK = 'DE_EVENT_TASK_ACTION';

  var EVT_PV = 'DE_EVENT_PV';

  var Cookie = {
    get: function (name) {
      var reg = '(^|)\\s*' + name + '=([^\\s]*)';
      var c = document.cookie.match(new RegExp(reg));

      return c && c.length >= 3 ? decodeURIComponent(c[2]) : null;
    },
    set: function (name, value, days, domain, path, secure) {
      var d;
      if (days) {
        d = new Date();
        d.setTime(d.getTime() + days * 8.64e7);
      }
      var expiresStr = days ? ' expires=' + d.toGMTString() : '';
      var pathStr = ' path=' + (path || '/');
      var domainStr = domain ? ' domain=' + domain : '';
      var secureStr = secure ? ' secure' : '';
      document.cookie = name + '=' + encodeURIComponent(value) + expiresStr + pathStr + domainStr + secureStr;
    },
    remove: function (name, domain, path) {
      Cookie.set(name, '', -1, domain, path);
    }
  };

  var hasStorage = !!window.localStorage || engine.isEgret || engine.isCocos || engine.isLayabox;

  function hasDOM() {

    if (document && isFunction(document.createElement)) {
      /**
       * document.createElement is not reliable
       * since there is some kind browser you can just create canvas only
       */
      var node = document.createElement('div');

      /**
       * node may be an empty object or null (layabox earlier version)
       */
      if (!node) return false;

      /**
       * detect logic, create dom and exec query
       */
      if (isFunction(node.querySelector)) {
        node.innerHTML = '<i></i>';

        var el = node.querySelector('i');

        return !!el && el.tagName === 'I';
      }

      /**
       * for old browsers such as IE version < 9
       */
      if (isFunction(node.getElementsByTagName)) {
        var children = node.getElementsByTagName('i');

        return !!children && children.length === 1;
      }
    }

    return false;
  }

  var isStandardBrowser = hasDOM();
  var hasCookie = isStandardBrowser && 'cookie' in document;

  var location = topThis.location || {};

  var protocol = location.protocol === 'https:' ? 'https:' : 'http:';
  var useXDR = !!window.XDomainRequest;

  var cookie = Client.hasCookie ? Cookie : {
    get: utils.noop,
    set: utils.noop
  };

  var _Cookie = cookie;

  var localstorage;

  /**
   * see egret core at src/context/localStorage/localStorage.ts
   */
  if (engine.isEgret) {
    localstorage = window.egret.localStorage;
  } else if (engine.isCocos) {
    localstorage = window.cc.sys.localStorage;
  } else {
    // layabox也是localStorage
    localstorage = hasStorage ? window.localStorage : {
      getItem: noop,
      setItem: noop,
      removeItem: noop
    };
  }

  var D__git_dcagent_src_compats_localStorage = localstorage;

  function wrapKey(key) {
    return config.appId + '.' + key;
  }

  function setUID(key, value) {
    key = wrapKey(key);
    D__git_dcagent_src_compats_localStorage.setItem(key, value);
    _Cookie.set(key, value, 3650);
  }

  function _getUID(key) {
    key = wrapKey(key);
    return D__git_dcagent_src_compats_localStorage.getItem(key) || _Cookie.get(key);
  }

  function setItem(key, value) {
    D__git_dcagent_src_compats_localStorage.setItem(wrapKey(key), value);
  }

  function getItem(key) {
    return D__git_dcagent_src_compats_localStorage.getItem(wrapKey(key));
  }

  function removeItem(key) {
    D__git_dcagent_src_compats_localStorage.removeItem(wrapKey(key));
  }

  /**
   * 用户退出时将当前数据保存到本地存储
   */
  function saveToStorage() {
    storage.setItem(CONST.LOGOUT_TIME, utils.parseInt(Date.now() / 1000));

    if (errors.length || events.length) {
      storage.setItem(CONST.QUIT_SNAPSHOT, utils.jsonStringify(collect()));
    }
  }

  /**
   * 用户进入时从本地存储导入数据
   */
  function loadFromStorage() {
    var params = storage.getItem(CONST.QUIT_SNAPSHOT);
    return params && utils.jsonParse(params);
  }

  function addError(item) {
    if (totalError >= defaults.MAX_ERROR_COUNT) return;

    errors.push(item);

    totalError += 1;
  }

  function addEvent(item) {
    events.push(item);
  }

  function onEvent(eventId, json) {
    if (!eventId) {
      utils.tryThrow("Missing eventId");
      return;
    }

    var replace = function (str) {
      return str.replace(/%/g, '_');
    };

    // 兼容v1的三个参数的情况
    if (arguments.length > 2) {
      json = arguments[2];
    }

    var eventMap = {};
    if (utils.isObject(json)) {
      for (var key in json) {
        // 没有编码，移除%
        eventMap[replace(key)] = typeof json[key] === 'number' ? json[key] : encodeURIComponent(json[key]);
      }
    }

    var data = {
      eventId: replace(eventId),
      eventMap: eventMap
    };

    dataCenter.addEvent(data);

    // 立即发送请求
    if (json && json.immediate) {
      onlineTimer.stop();
      onlineTimer.run();
      return false;
    }
  }

  function getUid() {
    return config.uid || '';
  }

  // 全部请求失败的次数
  var failedCount = 0;

  /**
   * for Egret Runtime and Native
   */
  function egretRequest(opts) {
    var egret = window.egret;
    var loader = new egret.URLLoader();
    var start = Date.now();

    loader.addEventListener(egret.Event.COMPLETE, function onNativeRequestComplete(e) {
      var elapsed = Date.now() - start;
      var context = e.target;
      var isValid = context.data === 'success';

      utils.attempt(isValid ? opts.success : opts.error, context, [context, elapsed, elapsed >= opts.timeout]);
      utils.attempt(opts.complete, context, [context, elapsed]);
      // TODO 白鹭这里能够获取headers吗？
    });

    var request = new egret.URLRequest(opts.url);
    request.method = opts.method || egret.URLRequestMethod.POST;
    request.data = utils.jsonStringify(opts.data);
    loader.load(request);
  }

  var xhrSupport;

  var createBrowserXHR = Client.useXDR ? function () {
    return new window.XDomainRequest();
  } : function () {
    return new window.XMLHttpRequest();
  };

  /**
   * for standard browser and layabox, or cocos
   */
  function createCocosXHR() {
    return window.cc.loader.getXMLHttpRequest();
  }

  var createXHR = engine.isCocos ? createCocosXHR : createBrowserXHR;

  /**
   * 切断网络或者手机切到后台可能导致timeout
   * IE 9有XMLHttpRequest，但是timeout属性不能设置
   */
  function _request(opts) {
    var xhr = createXHR();
    if (xhrSupport.timeout) {
      xhr.timeout = opts.timeout;
    }
    xhr.open(opts.method || 'POST', opts.url, true);
    xhrSupport.setContentType(xhr, 'text/plain; charset=UTF-8');

    var start = Date.now();

    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) return;

      var isValid = this.status >= 200 && this.status < 300;
      var elapsed = Date.now() - start;

      utils.attempt(isValid ? opts.success : opts.error, this, [this, elapsed]);
      utils.attempt(opts.complete, this, [this, elapsed]);

      this.onreadystatechange = null;
      this.ontimeout = null;
    };

    if (xhrSupport.timeout) {
      xhr.ontimeout = function () {
        var elapsed = Date.now() - start;

        utils.attempt(opts.error, this, [this, elapsed, true]);
        utils.attempt(opts.complete, this, [this, elapsed]);

        this.onreadystatechange = null;
        this.ontimeout = null;
      };
    }

    xhr.send(utils.jsonStringify(opts.data));
  }

  function getXHRSupport() {
    /**
     * VS的WP打包环境有XHR，没有XDR，但是XHR的timeout只读
     * Lumia 640有XDR，但是contentType只读
     * https://msdn.microsoft.com/library/cc288060(v=vs.85).aspx
     */
    var supportTimeout = true;
    var supportContentType = true;
    var xhr = createXHR();
    try {
      xhr.timeout = 1;
    } catch (e) {
      supportTimeout = false;
    }

    try {
      xhr.contentType = 'text/plain; charset=UTF-8';
    } catch (e) {
      supportContentType = false;
    }

    var setContentType = Client.useXDR ? function (xhr, value) {
      if (supportContentType) {
        xhr.contentType = value;
      }
    } : function (xhr, value) {
      xhr.setRequestHeader('Content-Type', value);
    };

    return {
      timeout: supportTimeout,
      contentType: supportContentType,
      setContentType: setContentType
    };
  }

  var ajax = (function () {
    // for browser layabox cocos
    if (window.XMLHttpRequest || engine.isCocos) {
      xhrSupport = getXHRSupport();
      return _request;
    }

    if (engine.isEgret) return egretRequest;

    utils.log('XMLHttpRequest not found');
    return utils.noop;
  })();

  // 最近一次上报的数据
  exports.report;

  // 全部请求次数
  var reportCount = 0;

  // 上次请求发生时间
  var lastRequestTime = Date.now() - defaults.ASAP_TIMEOUT;

  function request(opts, force) {
    var now = Date.now();

    /**
     * 频率控制
     * 强制上报的请求不受限制
     */
    if (!force) {
      if (now - lastRequestTime < defaults.ASAP_TIMEOUT) {
        utils.tryThrow('Request dropped: rate limit');
        return;
      }

      lastRequestTime = now;
    }

    reportCount += 1;
    exports.report = opts.data;

    ajax({
      url: opts.url,
      data: opts.data,
      success: function (xhr, elapsed) {
        utils.attempt(opts.success, xhr, [xhr, elapsed]);
      },
      error: function (xhr, elapsed, isTimeout) {
        failedCount += 1;
        utils.attempt(opts.error, xhr, [xhr, elapsed, isTimeout]);
      },
      complete: function (xhr, elapsed) {
        utils.attempt(opts.complete, xhr, [xhr, elapsed]);

        /**
         * 重新设置定时器
         */
        if (!xhr.getAllResponseHeaders || !xhr.getResponseHeader) return;

        var headers = xhr.getAllResponseHeaders();
        var header = 'X-Rate-Limit';
        if (headers.indexOf(header) === -1) return;

        var interval = utils.parseInt(xhr.getResponseHeader(header));
        if (interval > 1) {
          onlineTimer.reset(interval * 1000);
        }
      }
    });
  }

  /**
   * 验证上报参数是否合法
   */
  function isParamsValid(data) {
    if (!data) return false;

    var onlineTime = data.onlineInfo.onlineTime;
    if (onlineTime < 1 || onlineTime > defaults.MAX_ONLINE_TIME) {
      utils.tryThrow('Illegal online time');
      return false;
    }

    return true;
  }

  function shouldBeInited() {
    if (!stateCenter.inited) {
      utils.tryThrow('DCAgent.init needed');
      return false;
    }
  }

  function shouldBeLoggedIn() {
    if (!stateCenter.loginTime) {
      utils.tryThrow('DCAgent.login needed');
      return false;
    }
  }

  function shouldNotBeDestoryed() {
    if (stateCenter.destroyed) {
      utils.tryThrow('DCAgent is destroyed already');
      return false;
    }
  }

  var API_PATH = Client.protocol + '//' + CONST.HOST + CONST.API_PATH;

  function appendOnline(uri) {
    return uri + '?__deuid=' + config.uid + '&__deappid=' + config.appId;
  }

  function appendEcho(uri) {
    return uri + '?type=h520&appId=' + config.appId + '&uid=' + config.uid + '&mac=' + (config.mac || '') + '&imei=' + (config.imei || '') + '&idfa=' + (config.idfa || '');
  }

  function onlinePolling(force, payment, reg) {
    // 如果文档被隐藏暂时不上报
    if (!force && utils.hiddenProperty && document[utils.hiddenProperty]) return;

    var opts = {
      url: uri.appendOnline(uri.API_PATH)
    };

    var offsetLen = 1;

    /**
     * 上报质量统计，每隔多少个周期上报，默认为10
     */
    if (reportCount && reportCount % stateCenter.oss === 0) {
      dataCenter.addEvent({
        eventId: CONST.REQ_KEY,
        eventMap: {
          succ: reportCount - failedCount,
          fail: failedCount,
          total: reportCount
        }
      });

      offsetLen += 1;
    }

    opts.data = dataCenter.collect(payment, reg);

    // report event immediately if set with immediate
    var recentEvent = opts.data.eventInfoList[opts.data.eventInfoList.length - offsetLen];
    if (recentEvent && recentEvent.eventMap && recentEvent.eventMap.immediate) {
      force = true;
    }

    if (!validator.isParamsValid(opts.data)) return;

    dataCenter.clear();

    /**
     * 如果上传失败将本次数据回写
     */
    var errors = opts.data.errorInfoList;
    var events = opts.data.eventInfoList;
    if (events.length || errors.length) {
      opts.error = function () {
        errors.forEach(function (item) {
          dataCenter.addError(item);
        });

        events.forEach(function (item) {
          dataCenter.addEvent(item);
        });
      };
    }

    request(opts, force);
  }

  var controlTimeoutID;

  /**
   * 优化接口调用的数据上报
   * 使其尽可能快地批量上报数据
   */
  function setPollingDebounce(wait) {
    if (!wait) {
      wait = defaults.ASAP_TIMEOUT;
    }

    clearTimeout(controlTimeoutID);

    onlineTimer.stop();
    controlTimeoutID = setTimeout(function () {
      onlineTimer.run();
    }, wait);
  }

  /**
   * 连续多次调用login会切换帐户
   * 由于login存在异步请求，所以依赖于login的接口需要判断loginStatus
   */
  function login(accountID) {
    if (!accountID) {
      utils.tryThrow('Missing accountID');
      return;
    }

    /**
     * 没有帐号系统的app可以使用uid作为帐户ID
     * DCAgent.login(DCAgent.getUid())
     */
    if (config.accountId === accountID) {
      // 防止两次重新登录导致登录时间不一致
      stateCenter.loginTime = stateCenter.loginTime || utils.parseInt(Date.now() / 1000);
      return;
    }

    // 暂停定时器，指定时间段以后开始在线上报
    controller.setPollingDebounce(stateCenter.interval);

    // 上报上个用户的所有数据
    onlinePolling(true);

    stateCenter.loginTime = utils.parseInt(Date.now() / 1000);

    // 清除上次用户设置
    var accountBaseSettings = CONST.ACCOUNT_RELATED_SETTINGS + ',' + CONST.ACCOUNT_ROLE_SETTINGS;
    accountBaseSettings.split(',').forEach(function (x) {
      return config[x] = '';
    });

    // 以下设置需设置为默认值
    config.age = defaults.DEFAULT_AGE;
    config.gender = defaults.DEFAULT_GENDER;
    config.roleLevel = defaults.DEFAULT_ROLE_LEVEL;
    config.accountId = accountID;

    // 上报当前用户的在线数据
    onlinePolling(true);
  }

  var initBasedAPI = {
    login: login,
    getUid: getUid,
    onEvent: onEvent
  };

  /**
   * 设置角色信息
   * 如果角色已经创建则每次都要设置角色信息
   * 参数依次为id, race, class, level
   */
  function setRoleInfo(roleID, roleRace, roleClass, roleLevel) {
    var _arguments = arguments;

    CONST.ACCOUNT_ROLE_SETTINGS.split(',').forEach(function (x, i) {
      return config[x] = _arguments[i] || '';
    });

    config.roleLevel = utils.parseInt(roleLevel) || 1;
  }

  /**
   * 创建角色
   * 参数依次为id, race, class, level
   */
  function createRole(roleID, roleRace, roleClass, roleLevel) {
    setRoleInfo(roleID, roleRace, roleClass, roleLevel);

    onEvent('DE_EVENT_CREATE_ROLE', {
      roleId: String(roleID),
      roleRace: String(roleRace),
      roleClass: String(roleClass)
    });
  }

  /**
   * @param gender {Number} 2为女性，1位男性
   */
  function setGender(gender) {
    config.gender = gender === 2 ? 2 : 1;
  }

  function setGameServer(serverID) {
    config.gameServer = String(serverID);
  }

  /**
   * @param age {Number} 1~128
   */
  function setAge(age) {
    age = utils.parseInt(age);
    config.age = age > 0 && age < 128 ? age : 0;
  }

  function setAccountType(typeID) {
    config.accountType = String(typeID);
  }

  function onTaskUnfinished(taskID, elapsed) {
    elapsed = utils.parseInt(elapsed);

    if (elapsed < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_TASK, {
      actionType: 'taskUnfinish',
      taskId: String(taskID),
      elapsed: elapsed
    });
  }

  function onTaskFinished(taskID, elapsed) {
    elapsed = utils.parseInt(elapsed);

    if (elapsed < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_TASK, {
      actionType: 'taskFinish',
      taskId: String(taskID),
      elapsed: elapsed
    });
  }

  function onPayment(opts) {
    if (!opts || !opts.hasOwnProperty('amount')) {
      utils.tryThrow('Missing amount');
      return;
    }

    var sendData = {
      // 1e21经过JSON.stringify会变成 '1e+21'
      currencyAmount: utils.max(parseFloat(opts.amount, 10) || 0),
      currencyType: opts.currencyType || 'CNY',
      payType: String(opts.payType || ''),
      iapid: String(opts.iapid || ''),
      payTime: utils.parseInt(Date.now() / 1000),
      extendMap: {
        orderId: String(opts.orderId || '')
      }
    };

    if (sendData.currencyAmount <= 0) {
      utils.tryThrow('amount must be greater than 0');
      return;
    }

    onlinePolling(true, sendData);
    return sendData;
  }

  function onMissionUnfinished(taskID, elapsed) {
    elapsed = utils.parseInt(elapsed);

    if (elapsed < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_MISSION, {
      actionType: 'guankaUnfinish',
      guankaId: String(taskID),
      duration: elapsed
    });
  }

  function onMissionFinished(taskID, elapsed) {
    elapsed = utils.parseInt(elapsed);

    if (elapsed < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_MISSION, {
      actionType: 'guankaFinish',
      guankaId: String(taskID),
      duration: elapsed
    });
  }

  /**
   * 记录升级耗时
   */
  function onLevelUp(startLevel, endLevel, elapsed) {
    startLevel = utils.parseInt(startLevel);
    endLevel = utils.parseInt(endLevel);
    elapsed = utils.parseInt(elapsed);

    if (startLevel < 0 || endLevel < 0 || startLevel > endLevel || elapsed < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    config.roleLevel = endLevel;

    onEvent(CONST.EVT_LEVEL, {
      startLevel: startLevel,
      endLevel: endLevel,
      duration: elapsed
    });
  }

  /**
   * 记录关卡内道具消耗以及原因
   */
  function onItemUse(itemID, itemNum, missionID, reason) {
    itemNum = utils.parseInt(itemNum);

    if (itemNum < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_ITEM, {
      actionType: 'itemUse',
      itemId: String(itemID),
      itemNum: itemNum,
      reason: String(reason),
      missonID: String(missionID)
    });
  }

  /**
   * 记录关卡内道具产出以及原因
   */
  function onItemProduce(itemID, itemNum, missionID, reason) {
    itemNum = utils.parseInt(itemNum);

    if (itemNum < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_ITEM, {
      actionType: 'itemGet',
      itemId: String(itemID),
      itemNum: itemNum,
      reason: String(reason),
      missonID: String(missionID)
    });
  }

  /**
   * 记录关卡内使用虚拟币购买道具
   */
  function onItemBuy(itemID, itemNum, coinType, coinNum, missionID) {
    itemNum = utils.parseInt(itemNum);
    coinNum = utils.parseInt(coinNum);

    if (itemNum < 0 || coinNum < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_ITEM, {
      actionType: 'itemBuy',
      itemId: String(itemID),
      itemNum: itemNum,
      coinType: String(coinType),
      coinNum: coinNum,
      // 关卡ID
      missonID: String(missionID)
    });
  }

  /**
   * 消耗虚拟币，设置留存总量
   * @param gainNum 消耗数量
   * @param balanceNum 留存总量
   * @param coinType 虚拟币类型
   * @param reason 原因
   */
  function onCoinUse(useNum, balanceNum, coinType, reason) {
    balanceNum = utils.parseInt(balanceNum);
    useNum = utils.parseInt(useNum);

    if (balanceNum < 0 || useNum < 0) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_COIN, {
      actionType: 'coinUse',
      coinType: String(coinType),
      balanceNum: balanceNum,
      coinNum: useNum,
      reason: String(reason)
    });
  }

  /**
   * 获取虚拟币，设置留存总量
   * @param gainNum 获取数量
   * @param balanceNum 留存总量
   * @param coinType 虚拟币类型
   * @param reason 原因
   */
  function onCoinGet(gainNum, balanceNum, coinType, reason) {
    balanceNum = utils.parseInt(balanceNum);
    gainNum = utils.parseInt(gainNum);

    if (balanceNum < 0 || gainNum < 0 || balanceNum < gainNum) {
      utils.tryThrow('Argument error');
      return false;
    }

    onEvent(CONST.EVT_COIN, {
      actionType: 'coinGet',
      coinType: String(coinType),
      balanceNum: balanceNum,
      coinNum: gainNum,
      reason: String(reason)
    });
  }

  var loginBasedAPI = {
    onCoinGet: onCoinGet,
    onCoinUse: onCoinUse,
    onItemBuy: onItemBuy,
    onItemProduce: onItemProduce,
    onItemUse: onItemUse,
    onLevelUp: onLevelUp,
    onMissionFinished: onMissionFinished,
    onMissionUnfinished: onMissionUnfinished,
    onPayment: onPayment,
    onTaskFinished: onTaskFinished,
    onTaskUnfinished: onTaskUnfinished,
    setAccountType: setAccountType,
    setAge: setAge,
    setGameServer: setGameServer,
    setGender: setGender,
    setRoleInfo: setRoleInfo,
    createRole: createRole
  };

  var name;
  var preInit = [validator.shouldNotBeDestoryed, validator.shouldBeInited];
  var preLogin = [validator.shouldNotBeDestoryed, validator.shouldBeLoggedIn];
  var debounce = [function () {
    return controller.setPollingDebounce();
  }];

  /**
   * 校验是否已经初始化
   * onEvent需要debounce
   */
  for (name in initBasedAPI) {
    exports[name] = utils.aspect(initBasedAPI[name], preInit, name === 'onEvent' && debounce);
  }

  /**
   * 校验是否已登录
   * onPayment是立即调用
   * 此处的接口使用内置的onEvent函数
   */
  for (name in loginBasedAPI) {
    exports[name] = utils.aspect(loginBasedAPI[name], preLogin, name !== 'onPayment' && debounce);
  }

  function getLeavingEvent() {
    var props = ['pagehide', 'beforeunload', 'unload'];
    for (var i = 0; i < props.length; i += 1) {
      if ('on' + props[i] in window) return props[i];
    }
  }

  function onPlayerLeave(cb) {
    if (window.addEventListener) {
      var eventName = getLeavingEvent();
      if (eventName) {
        window.addEventListener(eventName, cb);
      }
    }
  }

  /**
   * 玩家退出时保存当前快照到本地
   * 下次进入时立刻上报这些数据
   */
  function restoreSnapshot(isNewUser) {
    if (!stateCenter.storage) return;

    onPlayerLeave(dataCenter.saveToStorage);
    // 新玩家不必上报
    if (isNewUser) return;

    var snapshot = dataCenter.loadFromStorage();
    if (!snapshot) return;

    request({
      url: uri.appendOnline(uri.API_PATH),
      data: snapshot
    }, true);

    storage.removeItem(CONST.QUIT_SNAPSHOT);
  }

  function onError() {
    window.addEventListener && window.addEventListener('error', function (e) {
      utils.attempt(function () {

        var params = {};
        var keys = ['colno', 'filename', 'lineno', 'message'];
        keys.forEach(function (i) {
          return params[i] = e[i] || '1';
        });

        var error = e.error || {};
        params.stack = encodeURIComponent(error.stack || error.stacktrace || '');
        params.type = error.name || 'Error';
        params.timestamp = parseInt(e.timeStamp / 1000);

        // 支持在错误发生时由用户自定义信息搜集
        if (utils.isFunction(stateCenter.getErrorScene)) {
          var customMsg = utils.attempt(stateCenter.getErrorScene, error, [e]);
          if (customMsg) {
            // 如果是对象按行转换成a=b
            if (utils.isObject(customMsg)) {
              var details = '';
              for (var key in customMsg) {
                details += '\t' + key + '=' + customMsg[key] + '\n';
              }

              customMsg = details;
            } else {
              customMsg = String(customMsg);
            }

            params.stack += '\n\nError scene:\n' + encodeURIComponent(customMsg);
          }
        }

        dataCenter.addError(params);
      });
    }, false);
  }

  /**
   * 不同的引擎获取不同的前缀
   */
  function getPrefix() {
    var timestamp = Date.now().toString(36).toUpperCase();
    var engine = Engine.engine;

    // 八位长度的36进制客户端时间戳
    if (engine.egret) {
      return CONST.EGRET_PREFIX + timestamp;
    }

    if (engine.layabox) {
      return CONST.LAYA_PREFIX + timestamp;
    }

    if (engine.cocos) {
      return CONST.COCOS_PREFIX + timestamp;
    }

    return CONST.UNKNOW_ENGINE + timestamp;
  }

  /**
   * 生成唯一的设备ID
   * 只在使用uuid的时候附加前缀，其他情况不附加
   * layabox返回结果
   * {
   *  	resolution:1440*900,
   *  	mac:xxxxx,
   *  	imei:[xxxxx,x],
   *  	imsi:[xx,xx],
   *  	os:android,
   *  	osversion:4.4
   *  	phonemodel:HTC
   *  	idfa:xxxx,
   * }
   */
  function getUID() {
    var uid;

    try {
      if (Engine.engine.layabox) {
        var deviceInfo = window.layabox.getDeviceInfo() || {};
        uid = deviceInfo.mac || deviceInfo.idfa;
        uid = uid && uid.replace(/[-_:=\s]+/g, '').toUpperCase();
      }
    } catch (e) {
      uid = null;
    }

    // 不足uid最小长度则补齐
    uid = utils.padding(uid, CONST.PADDING_STRING, defaults.UID_MIN_LENGTH);

    return uid || utils.uuid(getPrefix());
  }

  function settleUID(localUID) {
    /**
     * uid现在用户可以设置，所以会存在uid覆盖的情况
     * 如果覆盖则创建时间会更新
     * 更新uid不会改变是否首次激活
     */
    if (config.uid) {
      // uid小于32位的时候补齐，病毒传播的时候会校验上级节点ID
      var paddingUID = utils.padding(config.uid, CONST.PADDING_STRING, defaults.UID_MIN_LENGTH);

      // 判断补齐之后是否相等
      if (localUID !== paddingUID) {
        config.uid = paddingUID;
        localUID = paddingUID;
        storage.setItem(CONST.CREATE_TIME, utils.parseInt(Date.now() / 1000));
      }
    }

    var deviceID = localUID || getUID();
    storage.setUID(CONST.CLIENT_KEY, deviceID);

    return deviceID;
  }

  function initialize(options) {
    var localUID = storage.getUID(CONST.CLIENT_KEY);

    // 是否首次激活
    var isAct = localUID ? 0 : 1;

    var deviceId = settleUID(localUID);
    config.uid = deviceId;
    config.accountId = deviceId;

    if (options.errorReport) {
      onError();
    }

    // 不会随玩家切换帐号而改变
    stateCenter.initTime = utils.parseInt(Date.now() / 1000);

    /**
     * 白鹭引擎由于共享设备ID
     * 所以可能导致第一次进入游戏设备ID已经设置但是创建时间没有设置
     */
    var createTime = storage.getItem(CONST.CREATE_TIME);
    if (!createTime) {
      createTime = stateCenter.initTime;
      storage.setItem(CONST.CREATE_TIME, createTime);
    }

    stateCenter.createTime = utils.parseInt(createTime);

    /**
     * 将本次PV数据写入到本地存储
     * 不管第一次PV上报是否成功，后面只要有一次上报成功数据就会准确
     */
    var pageUrl = location.href || '!';

    dataCenter.addEvent({
      eventId: CONST.EVT_PV,
      eventMap: {
        page: encodeURI(pageUrl.split('?')[0])
      }
    });

    /**
     * 激活以及父节点信息，注册在激活时暂时默认为1，目前还没有单独的注册
     * 如果不是首次激活但是有parentId也不记录节点传播关系
     */
    var regParams = isAct ? {
      actTime: createTime,
      regTime: createTime
    } : null;

    // 在线（PV）上报
    onlinePolling(true, null, regParams);

    restoreSnapshot(isAct);

    // 开启在线轮询
    var interval = Math.max(defaults.MIN_ONLINE_INTERVAL, parseFloat(options.interval || defaults.MIN_ONLINE_INTERVAL)) * 1000;
    onlineTimer.set(onlinePolling, interval);
    stateCenter.interval = interval;
    stateCenter.inited = true;
  }

  /**
   * 验证用户参数
   */
  function checkArguments(options) {
    /**
     * 无痕模式（隐私模式）下本地存储无法使用
     * 如果提供了uid，不需要本地存储支持
     * 不过可能会损失部分在线数据
     */
    stateCenter.storage = utils.isLocalStorageSupported(storage);
    if (!options.uid && !stateCenter.storage) {
      return Client.hasStorage ? 'Storage quota error' : 'Storage not support';
    }

    if (stateCenter.inited) {
      return 'Initialization ignored';
    }

    if (!options || !options.appId) {
      return 'Missing appId';
    }

    // 统一大写
    options.appId = options.appId.toUpperCase();

    // 上报质量统计，设置每隔多少个请求上报一次
    stateCenter.oss = typeof options.oss === 'number' ? options.oss : 0;
    // 错误发生时捕捉错误现场
    stateCenter.getErrorScene = options.getErrorScene;
    // 使用何种app打开
    stateCenter.app = options.appName || '';
    // 流量来源
    stateCenter.from = options.from || utils.getHostName(document.referrer);

    /**
     * 读取用户设置
     */
    CONST.USER_INIT_BASE_SETTINGS.split(',').forEach(function (i) {
      if (options.hasOwnProperty(i)) {
        config[i] = options[i];
      }
    });
  }

  function init(options) {
    if (validator.shouldNotBeDestoryed() === false) return;

    var errorMSg = checkArguments(options);
    if (errorMSg) {
      return utils.tryThrow(errorMSg);
    }

    initialize(options);

    // 发送给后端的echo请求，便于接入层控制
    if (!utils.isDebug) {
      request({
        url: uri.appendEcho(Client.protocol + '//' + CONST.HOST + '/echo'),
        method: 'GET'
      }, true);
    }
  }

  // 显示使用exports，不然dc执行缓存的时候找不到对应的方法
  exports.init = init;

  function isReady() {
    return stateCenter.inited;
  }

  exports.isReady = isReady;

  function destroy() {
    cancel();

    stateCenter.destroyed = true;
  }

  exports.destroy = destroy;

  /**
   * 执行快速统计调用
   * dc('init', {...})
   * dc(onEvent, id, data)
   */
  var proxyName = window.DCAgentObject;
  if (proxyName) {
    var proxy = window[proxyName];
    if (utils.isFunction(proxy)) {
      var cache = proxy.cache;

      if (cache.length) {
        cache.forEach(function (args) {
          utils.attempt(exports[args[0]], exports, utils.slice(args, 1));
        });

        cache.length = 0;
      }
    }
  }

  var player = {
    get isNew() {
      var loginTime = stateCenter.loginTime || stateCenter.initTime;
      return stateCenter.createTime === loginTime;
    },
    get initTime() {
      return stateCenter.initTime;
    },
    get createTime() {
      return stateCenter.createTime;
    },
    get loginTime() {
      return stateCenter.loginTime;
    },
    get lastLogoutTime() {
      return parseInt(storage.getItem(CONST.LOGOUT_TIME));
    },
    get reportCount() {
      return reportCount;
    },
    get reportFailedCount() {
      return failedCount;
    }
  };

  exports.state = stateCenter;
  exports.player = player;
});