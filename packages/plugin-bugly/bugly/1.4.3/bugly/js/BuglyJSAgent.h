//
//  BuglyJSAgent.h
//  Bugly
//
//  Copyright © 2016年 Bugly. All rights reserved.
//
//

#ifndef __BUGLY_JS_AGENT_H__
#define __BUGLY_JS_AGENT_H__

#include "cocos2d.h"
#include "ScriptingCore.h"

#if COCOS2D_VERSION >= 0x00030500
#define BLYJSObject JS::HandleObject
#else
#define BLYJSObject JSObject*
#endif

class BuglyJSAgent {
public:

    static void registerJSFunctions(JSContext *cx, BLYJSObject object);
    
    static void registerJSExceptionHandler(JSContext * cx);
    static void reportJSError(JSContext *cx, const char *message, JSErrorReport *report);
    
    /* define js function 'buglySetUserId' */
    static bool setUserId(JSContext *cx, unsigned argc, JS::Value *vp);
    
    /* define js function 'buglySetTag' */
    static bool setTag(JSContext *cx, unsigned argc, JS::Value *vp);
    
    /* define js function 'buglyAddUserValue' */
    static bool addUserValue(JSContext *cx, unsigned argc, JS::Value *vp);
    
    /* define js function 'buglyLog' */
    static bool printLog(JSContext *cx, unsigned argc, JS::Value *vp);
};

#endif /* __BUGLY_JS_AGENT_H__ */
