//
//  BuglyLuaAgent.cpp
//  Bugly
//
//  Created by Yeelik on 16/4/25.
//
//

#include "BuglyLuaAgent.h"

#include "cocos2d.h"
#include "CCLuaEngine.h"

#include "CrashReport.h"

#ifndef CATEGORY_LUA_EXCEPTION
#define CATEGORY_LUA_EXCEPTION 6
#endif

#pragma mark - BuglyLuaAgent

/*
cocos2d::LuaEngine * BuglyLuaAgent::getLuaEngine() {
#if COCOS2D_VERSION >= 0x00030000
    return cocos2d::LuaEngine::getInstance();
#else
    return cocos2d::CCLuaEngine::defaultEngine();
#endif
}

lua_State *BuglyLuaAgent::getLuaState() {
    return BuglyLuaAgent::getLuaEngine()->getLuaStack()->getLuaState();
}
*/

void BuglyLuaAgent::registerLuaExceptionHandler(cocos2d::LuaEngine * engine) {
	lua_State *L = engine->getLuaStack()->getLuaState();

	lua_register(L, "buglyReportLuaException", BuglyLuaAgent::reportLuaException);
	lua_register(L, "buglySetUserId", BuglyLuaAgent::setUserId);
	lua_register(L, "buglySetTag", BuglyLuaAgent::setTag);
	lua_register(L, "buglyAddUserValue", BuglyLuaAgent::addUserValue);
	lua_register(L, "buglyRemoveUserValue", BuglyLuaAgent::removeUserValue);
	lua_register(L, "buglyLog", BuglyLuaAgent::printLog);

}

int BuglyLuaAgent::reportLuaException(lua_State *L) {
	const char* type = "";
	const char* msg = lua_tostring(L, 1);
	const char* traceback = lua_tostring(L, 2);
	bool quit = lua_toboolean(L, 3);

	CrashReport::reportException(CATEGORY_LUA_EXCEPTION, type, msg, traceback, quit);

	return 0;
}

int BuglyLuaAgent::setUserId(lua_State *L) {
	const char* userId = lua_tostring(L, 1);

	CrashReport::setUserId(userId);

	return 0;
}

int BuglyLuaAgent::setTag(lua_State *L) {
	int tag = lua_tonumber(L, 1);
	CrashReport::setTag(tag);

	return 0;
}

int BuglyLuaAgent::addUserValue(lua_State *L) {
	const char* key = lua_tostring(L, 1);
	const char* value = lua_tostring(L, 2);

	CrashReport::addUserValue(key, value);

	return 0;
}

int BuglyLuaAgent::removeUserValue(lua_State *L) {
	const char* key = lua_tostring(L, 1);

	CrashReport::removeUserValue(key);
	return 0;
}

int BuglyLuaAgent::printLog(lua_State *L) {
	int level = lua_tonumber(L, 1);
	const char* tag = lua_tostring(L, 2);
	const char* log = lua_tostring(L, 3);

	CrashReport::CRLogLevel crLevel = CrashReport::CRLogLevel::Off;
	switch (level) {
	case -1:
		crLevel = CrashReport::CRLogLevel::Off;
		break;
	case 0:
		crLevel = CrashReport::CRLogLevel::Verbose;
		break;
	case 1:
		crLevel = CrashReport::CRLogLevel::Debug;
		break;
	case 2:
		crLevel = CrashReport::CRLogLevel::Info;
		break;
	case 3:
		crLevel = CrashReport::CRLogLevel::Warning;
		break;
	case 4:
		crLevel = CrashReport::CRLogLevel::Error;
		break;
	}

	CrashReport::log(crLevel, tag, log);

	return 0;
}