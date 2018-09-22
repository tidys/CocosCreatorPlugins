let Module = require('module');
let Path = require('path');

function basenameNoExt(path) {
  return Path.basename(path, Path.extname(path) );
}

let originRequire = Module.prototype.require;
Module.prototype.require = function (path) {
  if (path.indexOf('modular-cocos2d-cut') !== -1) {
    return null;
  }
  return originRequire.apply(this, arguments);
};

// reimplement Module._findPath
let originFindPath = Module._findPath;
Module._findPath = function (request, paths, isMain) {
  if (window.qp && qp.modules) {
    let module = qp.modules[request];
    if (module) {
      return module.path;
    }
  }
  
  return originFindPath.apply(Module, arguments);
};

let originLoad = Module._load;
Module._load = function (request, parent, isMain) {

  if (window.qp && qp.modules) {
    let name = basenameNoExt(request);
    let module = qp.modules[name];

    let parentName = basenameNoExt(parent.filename);
    let parentModule = qp.modules[parentName];

    if (module && parentModule) {
      request = module.path;
     
      if (parentModule && module.parents.indexOf(parentModule) === -1) {
        module.parents.push(parentModule);
      }
    }
  }

  return originLoad.apply(Module, [request, parent, isMain]);
};

// reimplement Module._nodeModulePaths
let appPaths = Module._nodeModulePaths( _Settings.appPath );
let originResolveLookupPaths = Module._resolveLookupPaths;
Module._resolveLookupPaths = function () {
  let resolvedModule = originResolveLookupPaths.apply(Module, arguments);
  let paths = resolvedModule[1];
  appPaths.forEach(path => {
    if (paths.indexOf(path) === -1) {
      paths.push(path);
    }
  });
  return resolvedModule;
};
