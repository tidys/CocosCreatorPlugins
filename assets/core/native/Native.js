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
    // 旋转屏幕到横屏
    rotationSceneToLandscape(b, cb) {
        if (this._isLandScape() === b) {
            cb && cb();
            console.log("当前屏幕已经是指定的方向,无需旋转!");
            return;
        }
        if (cc.sys.isBrowser) {
            let frameSize = cc.view.getFrameSize();
            cc.view.setFrameSize(frameSize.height, frameSize.width);
        } else {
            console.log("平台： "+cc.sys.platform);
            if (cc.sys.platform === cc.sys.OS_ANDROID) {
                /*
                // 同时需要修改 frameworks\cocos2d-x\cocos\platform\android\CCApplication-android.cpp
                void Application::applicationScreenSizeChanged(int newWidth, int newHeight) {
                    // todo add code for scene
                    CCLOG("android Application::applicationScreenSizeChanged %d, %d", newWidth, newHeight);
                    cocos2d::GLView * cocosView = cocos2d::Director::getInstance()->getOpenGLView();
                    cocosView->setFrameSize(newWidth,newHeight);
                }
                */
                let className = "org/cocos2dx/javascript/AppActivity";
                let methodName = "sceneOrientationLandscape";
                let sign = "(Z)V";
                let ret = jsb.reflection.callStaticMethod(className, methodName, sign, b);
            } else if (cc.sys.platform === cc.sys.OS_IOS) {
                console.log("执行ios平台代码");
                jsb.reflection.callStaticMethod(
                    "AppController",
                    "sceneOrientationLandscape:",
                    b);
            }
        }
        // 延迟执行逻辑
        cb && setTimeout(function () {
            cb();
        }, 500);
    },
    _isLandScape() {
        let frameSize = cc.view.getFrameSize();
        if (frameSize.width > frameSize.height) {
            return true;
        } else {
            return false;
        }
    },

};