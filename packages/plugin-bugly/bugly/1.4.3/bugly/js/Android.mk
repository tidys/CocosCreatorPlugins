LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := bugly_agent_cocos_static_js

LOCAL_MODULE_FILENAME := libbuglyagentjs

LOCAL_SRC_FILES := BuglyJSAgent.cpp

LOCAL_CPPFLAGS := -D__STDC_LIMIT_MACROS=1  -Wno-invalid-offsetof

LOCAL_C_INCLUDES := $(LOCAL_PATH)\
$(LOCAL_PATH)/../ \
$(LOCAL_PATH)/../../ \
$(LOCAL_PATH)/../../../ \
$(LOCAL_PATH)/../../../cocos \
$(LOCAL_PATH)/../../../cocos/2d \
$(LOCAL_PATH)/../../../cocos/base \
$(LOCAL_PATH)/../../../cocos/2d/platform/android \
$(LOCAL_PATH)/../../../cocos/platform/android \
$(LOCAL_PATH)/../../../cocos/scripting/js-bindings/manual \
$(LOCAL_PATH)/../../../external/spidermonkey/include/android \
$(LOCAL_PATH)/../../../cocos/math/kazmath \
$(LOCAL_PATH)/../../../cocos/physics \
$(LOCAL_PATH)/../../../cocos2dx \
$(LOCAL_PATH)/../../../cocos2dx/include \
$(LOCAL_PATH)/../../../cocos2dx/platform/android \
$(LOCAL_PATH)/../../../cocos2dx/kazmath/include \
$(LOCAL_PATH)/../../../scripting/javascript/binding \
$(LOCAL_PATH)/../../../scripting/javascript/spidermonkey-android/include \
                        

include $(BUILD_STATIC_LIBRARY)