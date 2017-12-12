//
//  BuglyJSAgent.cpp
//  Bugly
//
//  Created by Yeelik on 16/4/25.
//
//

#include "BuglyJSAgent.h"

#include "cocos2d.h"
#include "ScriptingCore.h"

#include "jsb_helper.h"
#include "jsapi.h"
#include "jsfriendapi.h"
#include "cocos2d_specifics.hpp"

#include <string.h>

#include "CrashReport.h"

#ifndef CATEGORY_JS_EXCEPTION
#define CATEGORY_JS_EXCEPTION 5
#endif

void BuglyJSAgent::registerJSFunctions(JSContext *cx, BLYJSObject global){
    CCLOG("-> %s", __PRETTY_FUNCTION__);
    
    // register js function with c++ function
    JS_DefineFunction(cx, global, "buglySetUserId", BuglyJSAgent::setUserId,1, JSPROP_READONLY | JSPROP_PERMANENT);
    JS_DefineFunction(cx, global, "buglySetTag", BuglyJSAgent::setTag,1, JSPROP_READONLY | JSPROP_PERMANENT);
    JS_DefineFunction(cx, global, "buglyAddUserValue", BuglyJSAgent::addUserValue,2, JSPROP_READONLY | JSPROP_PERMANENT);
    JS_DefineFunction(cx, global, "buglyLog", BuglyJSAgent::printLog, 3, JSPROP_READONLY | JSPROP_PERMANENT);
}

void BuglyJSAgent::registerJSExceptionHandler(JSContext *cx){
    CCLOG("-> %s", __PRETTY_FUNCTION__);
    
    JS_SetErrorReporter(cx, BuglyJSAgent::reportJSError);
}

void BuglyJSAgent::reportJSError(JSContext *cx, const char *message, JSErrorReport *report){
    CCLOG("-> %s", __PRETTY_FUNCTION__);
    
    const char* format = "%s:%u:%s\n";
    const char* filename = report != nullptr && report->filename ? report->filename : "<no filename=\"filename\">";

    size_t bufLen = strlen(format) + strlen(filename) + strlen(message) + 32;
    char* traceback = (char*)malloc(bufLen);
    memset(traceback, 0, bufLen);
    sprintf(traceback, format, filename, (unsigned int)report->lineno, message);

    const char *reason = strstr(message, ":");
    const char *name = message;
    
    if (reason == nullptr) {
        reason = message;
    } else {
        size_t len = strlen(message) - strlen(reason);
        if (len > 0) {
            name = strndup(message, len);
            reason ++;
        }
    }
    
    CrashReport::reportException(CATEGORY_JS_EXCEPTION, (name != message) ? name : "JSError", message, traceback);
    free(traceback);
    
    if (name != message) {
        free((void*)name);
    }
}

bool BuglyJSAgent::setUserId(JSContext *cx, unsigned argc, JS::Value *vp){
    CCLOG("-> %s", __PRETTY_FUNCTION__);
    
    if (argc > 0) {
#if COCOS2D_VERSION >= 0x00030500
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    
        const char *userId;
        jsval_to_charptr(cx, args.get(0), &userId);
        CrashReport::setUserId(userId);
        
        args.rval().setUndefined();
#else
        jsval *argvp = JS_ARGV(cx, vp);
        
        const char *userId;
        jsval_to_charptr(cx, *argvp++, &userId);
        CrashReport::setUserId(userId);
#endif
    }
    
    return true;
}

bool BuglyJSAgent::setTag(JSContext *cx, unsigned argc, JS::Value *vp){
    CCLOG("-> %s", __PRETTY_FUNCTION__);
    
    if (argc > 0) {
#if COCOS2D_VERSION >= 0x00030500
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    
        int tag = 0;
        jsval_to_int(cx, args.get(0), &tag);
        CrashReport::setTag(tag);
    
        args.rval().setUndefined();
#else
        jsval *argvp = JS_ARGV(cx, vp);
        
        int tag = 0;
        jsval_to_int(cx, *argvp++, &tag);
        CrashReport::setTag(tag);
#endif
    }
    return true;
}

bool BuglyJSAgent::addUserValue(JSContext *cx, unsigned argc, JS::Value *vp) {
    CCLOG("-> %s", __PRETTY_FUNCTION__);
    
    if (argc > 1) {
#if COCOS2D_VERSION >= 0x00030500
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);

        const char *key, *value;
        jsval_to_charptr(cx, args.get(0), &key);
        jsval_to_charptr(cx, args.get(1), &value);
        CrashReport::addUserValue(key, value);
        
        args.rval().setUndefined();
        
#else
        jsval *argvp = JS_ARGV(cx, vp);
        
        const char *key, *value;
        jsval_to_charptr(cx, *argvp++, &key);
        jsval_to_charptr(cx, *argvp++, &value);
        
        CrashReport::addUserValue(key, value);
#endif
    }
    
    return true;
}

bool BuglyJSAgent::printLog(JSContext *cx, unsigned argc, JS::Value *vp){
    CCLOG("-> %s", __PRETTY_FUNCTION__);
    
    if (argc > 2) {
#if COCOS2D_VERSION >= 0x00030500
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    
        int level = 0;
        const char *tag, *msg;
        jsval_to_int(cx, args.get(0), &level);
        jsval_to_charptr(cx, args.get(1), &tag);
        jsval_to_charptr(cx, args.get(2), &msg);
        
        CrashReport::CRLogLevel pLevel = CrashReport::CRLogLevel::Off;
        switch (level) {
            case -1:
                pLevel = CrashReport::CRLogLevel::Off;
                break;
            case 0:
                pLevel = CrashReport::CRLogLevel::Verbose;
                break;
            case 1:
                pLevel = CrashReport::CRLogLevel::Debug;
                break;
            case 2:
                pLevel = CrashReport::CRLogLevel::Info;
                break;
            case 3:
                pLevel = CrashReport::CRLogLevel::Warning;
                break;
            case 4:
                pLevel = CrashReport::CRLogLevel::Error;
                break;
                
            default:
                break;
        }
        CrashReport::log(pLevel, tag, msg);
    
        args.rval().setUndefined();
#else
        jsval *argvp = JS_ARGV(cx, vp);
        
        int level = 0;
        const char *tag, *msg;
        jsval_to_int(cx, *argvp++, &level);
        jsval_to_charptr(cx, *argvp++, &tag);
        jsval_to_charptr(cx, *argvp++, &msg);
        
        CrashReport::CRLogLevel pLevel = CrashReport::CRLogLevel::Off;
        switch (level) {
            case -1:
                pLevel = CrashReport::CRLogLevel::Off;
                break;
            case 0:
                pLevel = CrashReport::CRLogLevel::Verbose;
                break;
            case 1:
                pLevel = CrashReport::CRLogLevel::Debug;
                break;
            case 2:
                pLevel = CrashReport::CRLogLevel::Info;
                break;
            case 3:
                pLevel = CrashReport::CRLogLevel::Warning;
                break;
            case 4:
                pLevel = CrashReport::CRLogLevel::Error;
                break;
                
            default:
                break;
        }
        CrashReport::log(pLevel, tag, msg);
#endif
    }
    
    return true;
}
