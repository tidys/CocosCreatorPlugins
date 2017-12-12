//
//  BuglyLuaAgent.hpp
//  Bugly
//
//  Copyright © 2016年 Bugly. All rights reserved.
//
//

#ifndef __BUGLY_LUA_AGENT_H__
#define __BUGLY_LUA_AGENT_H__

#include "CCLuaEngine.h"
#include "cocos2d.h"

class BuglyLuaAgent {
public:
    /*
	static cocos2d::LuaEngine *getLuaEngine();

	static lua_State *getLuaState();
    */
    
    /**
     *    @brief register lua exception handler
     *
     *    @param engine the lua engine
     */
	static void registerLuaExceptionHandler(cocos2d::LuaEngine * engine);

	/**
	 *    @brief binding lua function 'buglyReportLuaException
	 *
	 *    @param L lua_State which contains 3 arguments: {msg, traceback, quit}
     *      L[1] - string, msg
     *      L[2] - string, traceback
     *      L[3] - bool, quit
	 */
	static int reportLuaException(lua_State *L);

    /**
     *    @brief binding lua function 'buglySetUserId'
     *
     *    @param L lua_State which contains 1 arguments: {userId}
     *
     */
	static int setUserId(lua_State *L);

    /**
     *    @brief register lua function 'buglySetTag'
     *
     *    @param L lua_State which contains 1 arguments: {tag}
     *
     */
	static int setTag(lua_State *L);

    /**
     *    @brief register lua function 'buglyAddUserValue'
     *
     *    @param L lua_State which contains 2 arguments: {key, value}
     *
     */
	static int addUserValue(lua_State *L);

    /**
     *    @brief register lua function 'buglyRemoveUserValue'
     *
     *    @param L lua_State which contains 1 arguments: {key}
     *
     */
	static int removeUserValue(lua_State *L);

    /**
     *    @brief register lua function 'buglyLog'
     *
     *    @param L lua_State which contains 3 arguments: {level, tag, log}
     *      L[1] - int, level - which value is 0=Verbose, 1=Debug, 2=Info, 3=Warn, 4=Error
     *      L[2] - string, tag - the tag name of the log
     *      L[3] - string, log - the message of the log, NOT support format string, you should use it with string.format(...)
     *
     *    @code
     *
     *      buglyLog(2, "Login", string.format("Login user name: %s", user))
     */
	static int printLog(lua_State *L);
};

#endif /* __BUGLY_LUA_AGENT_H__ */
