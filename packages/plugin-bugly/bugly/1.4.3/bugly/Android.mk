LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := bugly_crashreport_cocos_static

LOCAL_MODULE_FILENAME := libcrashreport

LOCAL_CPP_EXTENSION := .mm .cpp .cc
LOCAL_CFLAGS += -x c++

LOCAL_SRC_FILES := CrashReport.mm 

LOCAL_C_INCLUDES := $(LOCAL_PATH)\
$(LOCAL_PATH)/../ \
$(LOCAL_PATH)/../../ \
$(LOCAL_PATH)/../../cocos/base \
$(LOCAL_PATH)/../../cocos \
$(LOCAL_PATH)/../../cocos/2d \
$(LOCAL_PATH)/../../cocos/2d/platform/android \
$(LOCAL_PATH)/../../cocos/platform/android \
$(LOCAL_PATH)/../../cocos/math/kazmath \
$(LOCAL_PATH)/../../cocos/physics \
$(LOCAL_PATH)/../../cocos2dx \
$(LOCAL_PATH)/../../cocos2dx/include \
$(LOCAL_PATH)/../../cocos2dx/platform/android \
$(LOCAL_PATH)/../../cocos2dx/kazmath/include \
$(LOCAL_PATH)/../../external

include $(BUILD_STATIC_LIBRARY)