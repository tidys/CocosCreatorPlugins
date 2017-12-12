
#include "CrashReport.h"

#include "cocos2d.h"
#include <string.h>

#define LOG_TAG "CrashReport"
#define LOG_BUFFER_SIZE 1024

#ifndef GAME_TYPE_COCOS
#define GAME_TYPE_COCOS 1
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)

	#include <android/log.h>
    #include <jni.h>
	#include "platform/android/jni/JniHelper.h"

	#define LOGD(fmt, args...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, fmt, ##args)
	#define LOGI(fmt, args...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, fmt, ##args)
	#define LOGW(fmt, args...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, fmt, ##args)
	#define LOGE(fmt, args...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, fmt, ##args)

	#define CRASHREPORT_CLASS "com/tencent/bugly/agent/GameAgent"
	#define METHOD_INIT "initCrashReport"
	#define METHOD_INIT_PARAMETER "(Ljava/lang/String;Z)V"
	#define METHOD_POST_EXCEPTION "postException"
	#define METHOD_POST_EXCEPTION_PARAMETER "(ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V"
	#define METHOD_SET_USER_ID "setUserId"
	#define METHOD_SET_USER_ID_PARAMETER "(Ljava/lang/String;)V"
    #define METHOD_SET_CHANNEL "setAppChannel"
    #define METHOD_SET_CHANNEL_PARAMETER "(Ljava/lang/String;)V"
    #define METHOD_SET_VERSION "setAppVersion"
    #define METHOD_SET_VERSION_PARAMETER "(Ljava/lang/String;)V"
    #define METHOD_SET_GAME_TYPE "setGameType"
    #define METHOD_SET_GAME_TYPE_PARAMETER "(I)V"
	#define METHOD_SET_LOG "setLog"
	#define METHOD_SET_LOG_PARAMETER "(ILjava/lang/String;Ljava/lang/String;)V"
	#define METHOD_SET_USER_SCENE_TAG "setUserSceneTag"
	#define METHOD_SET_USER_SCENE_TAG_PARAMETER "(I)V"
	#define METHOD_PUT_USER_DATA "putUserData"
	#define METHOD_PUT_USER_DATA_PARAMETER "(Ljava/lang/String;Ljava/lang/String;)V"
	#define METHOD_REMOVE_USER_DATA "removeUserData"
	#define METHOD_REMOVE_USER_DATA_PARAMETER "(Ljava/lang/String;)V"
	#define METHOD_SET_SDK_CHANNEL "setSdkPackageName"
	#define METHOD_SET_SDK_CHANNEL_PARAMETER "(Ljava/lang/String;)V"

#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    #import <Foundation/Foundation.h>

    #define NSStringMake(const_char_pointer) (const_char_pointer == NULL ? nil : @(const_char_pointer))
    #define NSStringMakeNonnull(const_char_pointer) (const_char_pointer == NULL ? @"" : @(const_char_pointer))

    #define LOGD(fmt, args...) CCLOG("[Debug] %s: " fmt, LOG_TAG, ##args)
    #define LOGI(fmt, args...) CCLOG("[Info] %s: " fmt, LOG_TAG, ##args)
    #define LOGW(fmt, args...) CCLOGERROR("[Warn] %s: " fmt, LOG_TAG, ##args)
    #define LOGE(fmt, args...) CCLOGERROR("[Error] %s: " fmt, LOG_TAG, ##args)

    #define BUGLY_AGENT_CLASS @"BuglyAgent"
    #define BUGLY_AGENT_METHOD_INIT @"initWithAppId:debugMode:"
    #define BUGLY_AGENT_METHOD_INIT_LOG @"initWithAppId:debugMode:logger:"
    #define BUGLY_AGENT_METHOD_USER @"setUserIdentifier:"
    #define BUGLY_AGENT_METHOD_CHANNEL @"setAppChannel:"
    #define BUGLY_AGENT_METHOD_VERSION @"setAppVersion:"
    #define BUGLY_AGENT_METHOD_EXCEPTION @"reportException:name:message:stackTrace:userInfo:terminateApp:"
    #define BUGLY_AGENT_METHOD_SCENE @"setSceneTag:"
    #define BUGLY_AGENT_METHOD_SCENE_VALUE @"setSceneValue:forKey:"
	#define BUGLY_AGENT_METHOD_SCENE_CLEAN @"removeSceneValueForKey:"
    #define BUGLY_AGENT_METHOD_LOG @"level:tag:log:"
    #define BUGLY_AGENT_METHOD_CONFIG_REPORTER_TYPE @"configCrashReporterType:"
#endif

CrashReport::CrashReport(){
    LOGD("%s", __FUNCTION__);
}

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)

bool CrashReport::checkPendingException(JNIEnv* env) {
    if (env == NULL) {
        return false;
    }
    
    if (env->ExceptionOccurred() != 0) {
        LOGE("[cocos2d-x] check jni error");
        env->ExceptionDescribe();
        env->ExceptionClear();
        return true;
    }
    return false;
}

JNIEnv* CrashReport::getJniEnv() {
    JavaVM* jvm = cocos2d::JniHelper::getJavaVM();
    if (jvm == NULL) {
        LOGE("[cocos2d-x] JavaVM is null.");
        return NULL;
    }
    JNIEnv* env = NULL;
    jvm->GetEnv((void**)&env, JNI_VERSION_1_6);
    if (env == NULL) {
        LOGE("[cocos2d-x] failed to get env.");
        return NULL;
    }
    return env;
}

jstring CrashReport::getJniString(JNIEnv* jniEnv, const char* str) {
    if (str == NULL) {
        return NULL;
    }
    
    JNIEnv *env = jniEnv;
    if (env == NULL) {
        env = getJniEnv();
    }
    if (env == NULL) {
        return NULL;
    }
    jstring jniString = env->NewStringUTF(str);
    if (checkPendingException(env)) {
        LOGE("[cocos2d-x] failed to new Java UTF string: %s", str);
        return NULL;
    }
    return jniString;
}

void CrashReport::releaseJniString(JNIEnv* jniEnv, jstring jniString) {
    if (jniString == NULL) {
        return;
    }
    
    JNIEnv *env = jniEnv;
    if (env == NULL) {
        env = getJniEnv();
    }
    if (env == NULL) {
        return;
    }
    env->DeleteLocalRef(jniString);
}

bool CrashReport::callJniStaticVoidMethod(JNIEnv* jniEnv, const char* className, const char* methodName, const char* paramType, ...) {
    if (className == NULL || methodName == NULL || paramType == NULL) {
		LOGE("[cocos2d-x] parameters input to callJniStaticVoidMethod is not enough.");
        return false;
    }
    
    JNIEnv *env = jniEnv;
    if (env == NULL) {
        env = getJniEnv();
    }
	if (env == NULL) {
		LOGE("[cocos2d-x] can not get JNIEnv.");
		return false;
	}
	jclass jniClass = env->FindClass(className);
    if (checkPendingException(env)) {
        LOGE("[cocos2d-x] failed to find class: %s", className);
        return false;
    }
	jmethodID method = env->GetStaticMethodID(jniClass, methodName, paramType);
    if (checkPendingException(env)) {
        LOGE("[cocos2d-x] failed to find method '%s' with param type '%s'.", methodName, paramType);
        return false;
    }

    va_list args;
    va_start(args, paramType);
    LOGI("[cocos2d-x] trying to call method: %s", methodName);
	env->CallStaticVoidMethodV(jniClass, method, args);
    va_end(args);

    if (checkPendingException(env)) {
        LOGE("[cocos2d-x] failed to call method: %s", methodName);
        return false;
    }
    return true;
}

#endif

void CrashReport::initCrashReport(const char* appId) {
    CrashReport::initCrashReport(appId, false);
}

void CrashReport::initCrashReport(const char* appId, bool isDebug) {
    CrashReport::initCrashReport(appId, isDebug, CrashReport::CRLogLevel::Off);
}

bool CrashReport::initialized = false;
bool CrashReport::hasSetGameType = false;
int CrashReport::crashReporterType = 0;

void CrashReport::initCrashReport(const char* appId, bool isDebug, CrashReport::CRLogLevel level) {
	if (!initialized) {
		#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
			LOGI("[cocos2d-x] start init.");
			initialized = true;
			JavaVM* jvm = cocos2d::JniHelper::getJavaVM();
			if (jvm == NULL) {
				LOGE("[cocos2d-x] JavaVM is null.");
				return;
			}
			JNIEnv* env = NULL;
			jvm->GetEnv((void**)&env, JNI_VERSION_1_6);
			if (env == NULL) {
				LOGE("[cocos2d-x] JNIEnv is null.");
				return;
			}
			jvm->AttachCurrentThread(&env, 0);
			//call channel set package name
            if (crashReporterType != 0) {
                
                LOGI("[cocos2d-x] set channel: %d", crashReporterType);
                const char* packageName = "";
                switch(crashReporterType) {
                    case 0:
                    case 1:
                        break;
                    case 2:
                        packageName = "com.tencent.bugly.msdk";
                        break;
                    case 3:
                        packageName = "com.tencent.bugly.imsdk";
                        break;
                    default:
                        break;
                }
                LOGI("set packagename: %s", packageName);
                jstring jPackageName = getJniString(env, packageName);
                callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_SET_SDK_CHANNEL, METHOD_SET_SDK_CHANNEL_PARAMETER, jPackageName);
                releaseJniString(env, jPackageName);
            }

            // set game type
            setGameType();

			// call init
			LOGI("[cocos2d-x] init Bugly by game agent.");
            jstring jAppId = getJniString(env, appId);
            callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_INIT, METHOD_INIT_PARAMETER, jAppId, isDebug);
            releaseJniString(env, jAppId);
        // iOS
		#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
        	NSString* pAppId = NSStringMake(appId);
            BOOL pDebug = isDebug ? YES : NO;
        
			Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
            if (clazz) {
                BOOL initLog = true;
                SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_INIT_LOG);
                
                NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
                if (signature == nil) {
                    selector = NSSelectorFromString(BUGLY_AGENT_METHOD_INIT);
                    signature = [clazz methodSignatureForSelector:selector];
                    
                    initLog = false;
                }
                if (signature) {
                    
                    LOGI("Init the sdk with App ID: %s", appId);
                    
                    NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
                    if (invocation) {
                        [invocation setTarget:clazz];
                        [invocation setSelector:selector];
                        
                        [invocation setArgument:&pAppId atIndex:2];
                        [invocation setArgument:&pDebug atIndex:3];
                        
                        if (initLog) {
                            //Error=4,Warn=3,Info=2,Debug=1,Verbose=0,Off=-1
                            //LogError=1<<0,Warn=1<<1,Info=1<<2,Debug=1<<3,Verbose=1<<4
                            NSInteger pLevel = level;
                            
                            [invocation setArgument:&pLevel atIndex:4];
                        }
                        
                        [invocation invoke];
                    }
                }
            } else {
                LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
            }
        #endif /* iOS */
            initialized = true;
		}
    
}

void CrashReport::setTag(int tag) {
    setGameType();
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	LOGI("[cocos2d-x] set user scene tag: %d", tag);
    
    callJniStaticVoidMethod(NULL, CRASHREPORT_CLASS, METHOD_SET_USER_SCENE_TAG, METHOD_SET_USER_SCENE_TAG_PARAMETER, tag);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    if (tag < 0) {
        return;
    }
	NSUInteger pTag = tag;
    
	Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_SCENE);
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        if (signature) {
            
            LOGI("Set user scene tag id: %d", tag);
            
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pTag atIndex:2];
                
                [invocation invoke];
            }
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::addUserValue(const char* key, const char* value) {
    setGameType();
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	LOGI("[cocos2d-x] put user data: %s:%s", key, value);
    JNIEnv* env = getJniEnv();
    
    jstring jKey = getJniString(env, key);
    jstring jValue = getJniString(env, value);
    callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_PUT_USER_DATA, METHOD_PUT_USER_DATA_PARAMETER, jKey, jValue);
    releaseJniString(env, jKey);
    releaseJniString(env, jValue);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	NSString * pKey = NSStringMakeNonnull(key);
	NSString * pValue = NSStringMakeNonnull(value);
    
	Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_SCENE_VALUE);
        
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        
        if (signature) {
            LOGI("Set user Key-Value: [%s, %s]", key, value);
            
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pValue atIndex:2];
                [invocation setArgument:&pKey atIndex:3];
                
                [invocation invoke];
            }
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::removeUserValue(const char* key) {
    setGameType();
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	LOGI("[cocos2d-x] remove user data: %s", key);
    
    JNIEnv* env = getJniEnv();
    
    jstring jKey = getJniString(env, key);
    callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_REMOVE_USER_DATA, METHOD_REMOVE_USER_DATA_PARAMETER, jKey);
    releaseJniString(env, jKey);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	NSString * pKey = NSStringMakeNonnull(key);
	
    Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_SCENE_CLEAN);
        
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        if (signature) {
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pKey atIndex:2];
                
                [invocation invoke];
            }
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::setUserId(const char* userId) {
    setGameType();
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    LOGI("[cocos2d-x] set user ID: %s", userId);
    
    JNIEnv* env = getJniEnv();
    
    jstring jUserId = getJniString(env, userId);
    callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_SET_USER_ID, METHOD_SET_USER_ID_PARAMETER, jUserId);
    releaseJniString(env, jUserId);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	NSString * pUserId = NSStringMake(userId);
	
    Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_USER);
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        if (signature) {
            LOGI("Set user id: %s", userId);
            
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pUserId atIndex:2];
                
                [invocation invoke];
            }
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::reportException(int category, const char* type, const char* msg, const char* traceback) {
    reportException(category, type, msg, traceback, false);
}

void CrashReport::reportException(int category, const char* type, const char* msg, const char* traceback, bool quit) {
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    LOGI("[cocos2d-x] post a exception.");
    JNIEnv* env = getJniEnv();
    
	jstring typeStr = getJniString(env, type);
	jstring msgStr = getJniString(env, msg);
	jstring traceStr = getJniString(env, traceback);
    callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_POST_EXCEPTION, METHOD_POST_EXCEPTION_PARAMETER, category, typeStr, msgStr, traceStr, quit);
    releaseJniString(env, typeStr);
    releaseJniString(env, msgStr);
    releaseJniString(env, traceStr);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	NSUInteger pCategory = category;
	NSString * pType = NSStringMake(type);
	NSString * pMsg = NSStringMake(msg);
	NSString * pTraceStack = NSStringMake(traceback);
    NSDictionary * nullObject = nil;
    BOOL terminateApp = quit ? YES : NO;

	Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_EXCEPTION);
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        
        if (signature) {
            LOGI("Report exception: %s\n%s", msg, traceback);
            
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pCategory atIndex:2];
                [invocation setArgument:&pType atIndex:3];
                [invocation setArgument:&pMsg atIndex:4];
                [invocation setArgument:&pTraceStack atIndex:5];
                [invocation setArgument:&nullObject atIndex:6];
                [invocation setArgument:&terminateApp atIndex:7];
                
                [invocation invoke];
            }
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::setAppChannel(const char * channel){
    setGameType();
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    LOGI("[cocos2d-x] set App channel: %s", channel);
    
    JNIEnv* env = getJniEnv();
    
    jstring jChannel = getJniString(env, channel);
    callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_SET_CHANNEL, METHOD_SET_CHANNEL_PARAMETER, jChannel);
    releaseJniString(env, jChannel);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    NSString * pUserId = NSStringMake(channel);
    
    Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_CHANNEL);
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        if (signature) {
            LOGI("Set channel: %s", channel);
            
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pUserId atIndex:2];
                
                [invocation invoke];
            }
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::setAppVersion(const char * version){
    setGameType();
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    LOGI("[cocos2d-x] set App version: %s", version);
    JNIEnv* env = getJniEnv();
    
    jstring jVersion = getJniString(env, version);
    callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_SET_VERSION, METHOD_SET_VERSION_PARAMETER, jVersion);
    releaseJniString(env, jVersion);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    NSString * pUserId = NSStringMake(version);
    
    Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_VERSION);
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        if (signature) {
            LOGI("Set version: %s", version);
            
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pUserId atIndex:2];
                
                [invocation invoke];
            }
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::log(CrashReport::CRLogLevel level, const char * tag, const char * fmts, ...) {
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    static char msg[LOG_BUFFER_SIZE];
    va_list args;
    va_start(args, fmts);
    int size = vsnprintf(msg, LOG_BUFFER_SIZE, fmts, args);
    va_end(args);
    if (size > LOG_BUFFER_SIZE) {
        LOGW("The length[%d] of string is out of the buffer size[%d]", size, LOG_BUFFER_SIZE);
    }
    // CCLOG("[LOG] %s: %s", tag, msg);
    
    JNIEnv* env = getJniEnv();
    jstring jTag = getJniString(env, tag);
    jstring jMsg = getJniString(env, msg);
    callJniStaticVoidMethod(env, CRASHREPORT_CLASS, METHOD_SET_LOG, METHOD_SET_LOG_PARAMETER, (int)level, jTag, jMsg);
    releaseJniString(env, jTag);
    releaseJniString(env, jMsg);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    if (NULL == fmts) {
        return;
    }

    static char msg[LOG_BUFFER_SIZE];
    va_list args;
    
    va_start(args, fmts);
    int size = vsnprintf(msg, LOG_BUFFER_SIZE, fmts, args);
    va_end(args);
    
    if (size > LOG_BUFFER_SIZE) {
        LOGW("The length[%d] of string is out of the buffer size[%d]", size, LOG_BUFFER_SIZE);
    }
    
    // CCLOG("[LOG] %s: %s", tag, msg);
    
    NSString * pMsg = NSStringMake(msg);
    NSString * pTag = NSStringMake(tag);
    
    //Error=4,Warn=3,Info=2,Debug=1,Verbose=0,Off=-1
    //LogError=1<<0,Warn=1<<1,Info=1<<2,Debug=1<<3,Verbose=1<<4
    NSInteger pLevel = (level >= 4 ? 1 : (level == 3 ? 2 : (level == 2 ? 4 : (level == 1 ? 8 : (level == 0 ? 16 : 0)))));
    
    Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_LOG);
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        
        if (signature) {
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pLevel atIndex:2];
                [invocation setArgument:&pTag atIndex:3];
                [invocation setArgument:&pMsg atIndex:4];
                
                [invocation invoke];
            }
        } else {
            LOGE("Fail to methodSignatureForSelector %s", BUGLY_AGENT_METHOD_LOG.UTF8String);
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
#endif
}

void CrashReport::setGameType(){
    if (hasSetGameType) {
        return;
    }
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    if (callJniStaticVoidMethod(NULL, CRASHREPORT_CLASS, METHOD_SET_GAME_TYPE, METHOD_SET_GAME_TYPE_PARAMETER, GAME_TYPE_COCOS)) {
        hasSetGameType = true;
    }

#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)

#endif
}

void CrashReport::setCrashReporterType(int type) {
    crashReporterType = type;
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    // Android
    LOGD("Set the crash reporter type: %d", type);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    //  iOS
    NSInteger pType = type;
    
    Class clazz = NSClassFromString(BUGLY_AGENT_CLASS);
    if (clazz) {
        SEL selector = NSSelectorFromString(BUGLY_AGENT_METHOD_CONFIG_REPORTER_TYPE);
        
        NSMethodSignature* signature = [clazz methodSignatureForSelector:selector];
        
        if (signature) {
            LOGI("Config crash reporter type: %d", type);
    
            NSInvocation* invocation = [NSInvocation invocationWithMethodSignature:signature];
            if (invocation) {
                [invocation setTarget:clazz];
                [invocation setSelector:selector];
                
                [invocation setArgument:&pType atIndex:2];
                
                [invocation invoke];
            } else {
                LOGE("Fail to invocationWithMethodSignature for selector %s", BUGLY_AGENT_METHOD_CONFIG_REPORTER_TYPE.UTF8String);
            }
        } else {
            LOGE("Fail to methodSignatureForSelector %s", BUGLY_AGENT_METHOD_CONFIG_REPORTER_TYPE.UTF8String);
        }
    } else {
        LOGE("Fail to get class by NSClassFromString(%s)", BUGLY_AGENT_CLASS.UTF8String);
    }
    
#endif
}
