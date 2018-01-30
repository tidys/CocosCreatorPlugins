module.exports = {
    // 获取网络状态
    /*
        1)android java:


        2）IOS:（需要Reachability.h 和Reachability.m，可以去苹果下载，或者用附件里我用的Reachability.rar11 (2.8 KB)）
        // -1:nonetwork, 0:未知,1:wifi, 2: mobile : 3:net
        int getNetworkType(){
        Reachability *reach = [Reachability reachabilityForInternetConnection];
        int iType = 0;
        switch ([reach currentReachabilityStatus]) {
        case NotReachable:// 没有网络
        iType = -1;
        break;
        case ReachableViaWiFi:// Wifi
        iType = 1;
        break;
        case ReachableViaWWAN:// 手机自带网络
        iType = 2;
        break;
        }
        return iType;
        }
    * */
    getNetIsConnect() {
        if (cc.sys.isBrowser) {
            return navigator.onLine;
        } else if (cc.sys.isNative) {
            if (cc.sys.platform === cc.sys.ANDROID) {
                let className = "org/cocos2dx/javascript/NativeActivity";
                let methodName = "getNetState";
                let sign = "()I";
                let type = jsb.reflection.callStaticMethod(className, methodName, sign);
                console.log("net type: " + type);
                if (type === -1) {// 网络未连接
                    return false;
                } else {
                    return true;
                }
            } else if (cc.sys.platform === cc.sys.IPAD || cc.sys.platform === cc.sys.IPHONE) {

            }
            return true;
        }
    },

    /*安卓崩溃代码
    *
    *
    *
    * */
    test() {
        if (cc.sys.isBrowser) {
            return navigator.onLine;
        } else if (cc.sys.isNative) {
            if (cc.sys.platform === cc.sys.ANDROID) {
                let className = "org/cocos2dx/javascript/NativeActivity";
                let methodName = "test";
                let sign = "()I";
                let ret = jsb.reflection.callStaticMethod(className, methodName, sign);
            } else if (cc.sys.platform === cc.sys.IPAD || cc.sys.platform === cc.sys.IPHONE) {

            }
            return true;
        }
    },
    rotationSceneToLandscape(b,cb) {
        if (cc.sys.isBrowser) {

        } else {
            if (cc.sys.platform === cc.sys.ANDROID) {
                let className = "org/cocos2dx/javascript/AppActivity";
                let methodName = "sceneOrientationLandscape";
                let sign = "(Z)V";
                let ret = jsb.reflection.callStaticMethod(className, methodName, sign, b);
            }
        }
    }

};