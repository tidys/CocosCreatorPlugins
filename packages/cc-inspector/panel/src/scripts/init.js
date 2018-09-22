'use strict';

const ipcRenderer = require('electron').ipcRenderer;
const Path = require('fire-path');
const Globby = require('globby');
const Fs = require('fire-fs');
const Del = require('del');

// reload
let errorList = [];
let reloadTimeoutId;
function reload () {
  if (!reloadTimeoutId) {
    reloadTimeoutId = setTimeout(() => {
      if (errorList.length === 0) {
        window.reloadScene();
      }
      reloadTimeoutId = null;
    }, 100);
  }
}

function unregisterPathClass (path) {
  let name = Path.basenameNoExt(path);
  if (!qp.modules[name]) return;

  let cls = cc.js.getClassByName( name );
  if (cls) {
    cc.js.unregisterClass( cls );
  }

  delete require.cache[path];
  delete qp.modules[name];
}

function registerPathClass (path) {
  let module = qp._addModule(path);
  if (!module) return;

  try {
    module.module = require(path);
    cc.js.array.remove(errorList, path);
  }
  catch(err) {
    errorList.push(path);
    unregisterPathClass(path);
    // console.error(err);
    console.log(err);
  } 
}

function reregisterParentModules (module) {
  if (!module) return;

  for (let i = 0; i < module.parents.length; i++) {
    let parentModule = module.parents[i];
    let parentPath = parentModule.path;
    unregisterPathClass(parentPath);
    registerPathClass(parentPath);

    reregisterParentModules(parentModule);
  }
}

// ipc messages
ipcRenderer.on('generate-src-file-complete', (event, src, dst) => {
  let name = Path.basenameNoExt(dst);
  let module = qp.modules[name];

  unregisterPathClass(dst);
  registerPathClass(dst);

  reregisterParentModules(module);

  reload();
});

ipcRenderer.on('reload-scene', () => {
  reload();
});


let watcher;

// quick preview
window.qp = {
  modules: {},
  
  _updateModules: function (cb) {
    let pattern = Path.join(_Settings.tmpScriptPath, '**/*.js');

    Globby.sync(pattern)
      .forEach(path => {
        path = Path.normalize(path);
        this._addModule(path);
      }
    );
  },

  _addModule: function (path) {
    let name = Path.basenameNoExt(path);
    let module = this.modules[name];

    if (qp.plugins.indexOf(name) !== -1) {
      if (module) {
        this.unregisterPathClass(module.path);
      }
      return null;
    }

    if (!module) {
      module = this.modules[name] = {
        name: name,
        path: path,
        parents: []
      };
    }

    return module;
  },

  _watch: function () {
    if (watcher) return;

    const Chokidar = require('chokidar');

    let pattern = require('../../types').map(extname => {
      return Path.join(_Settings.assetPath, '**/*' + extname);
    });

    watcher = Chokidar.watch(pattern, {
      ignoreInitial: true
    });
    
    watcher.on('all', (event, path) => {
      let src = path;
      let dst = Path.join(_Settings.tmpScriptPath, 'assets', Path.relative(_Settings.assetPath, path));
      dst = Path.join(Path.dirname(dst), Path.basenameNoExt(dst) + '.js');

      if (event === 'change') {
        ipcRenderer.send('generate-src-file', src, dst);
      }
      else if (event === 'add') {
        qp._updateModules();
        ipcRenderer.send('generate-src-file', src, dst);
      }
      else if (event === 'unlink') {
        unregisterPathClass(dst);

        if (Fs.existsSync(dst)) {
          try {
            Del.sync(dst, {force: true});
          }
          catch(err) {
            Editor.error(err);
          }
        }
      }
    });
  },

  init: function () {
    if (this._inited) return;
    this._inited = true;

    qp._updateModules();

    for (let name in this.modules) {
      registerPathClass(this.modules[name].path);
    }

    qp._watch();
  },

  loadScript: function (src, callback) {
      var timer = 'load ' + src;
      var scriptElement = document.createElement('script');

      function done() {
          // console.timeEnd(timer);
          // deallocation immediate whatever
          scriptElement.remove();
      }

      scriptElement.onload = function () {
          done();
          callback();
      };
      scriptElement.onerror = function () {
          done();
          var error = 'Failed to load ' + src;
          console.error(error);
          callback(new Error(error));
      };
      scriptElement.setAttribute('type','text/javascript');
      scriptElement.setAttribute('charset', 'utf-8');
      scriptElement.setAttribute('src', src);

      // console.time(timer);
      document.head.appendChild(scriptElement);
  },

  loadPlugins: function (cb) {
    // jsList
    var jsList = _CCSettings.jsList || [];
    jsList = jsList.map(function (x) { return _Settings.rawAssetsBase + x; });

    this.plugins = jsList.map(path => {
      return Path.basenameNoExt(path);
    });
    
    let originModule = window.module;
    window.module = null;
    cc.loader.load(jsList, function () {
        window.module = originModule;
        if (cb) cb();    
    });
  },

  _moduleStack: [],
  _RFpush: function (module) {
    let stack = this._moduleStack;
    if (stack.length > 0) {
      module.ccParent = stack[stack.length - 1];
    }
    stack.push(module);

    cc._RF.push.apply(cc._RFpush, arguments);
  },

  _RFpop: function (module) {
    this._moduleStack.pop();

    cc._RF.pop.apply(cc._RFpush, arguments);
  }
};
