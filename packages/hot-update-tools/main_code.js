(function () {
    if (cc && cc.sys.isNative) {
        var hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
            console.log('[main.js] 热更新SearchPath: ' + JSON.parse(hotUpdateSearchPaths));
        } else {
            console.log('[main.js] 未获取到热更新资源路径!');
        }
    } else {
        console.log('[main.js] 不是native平台!');
    }
})
