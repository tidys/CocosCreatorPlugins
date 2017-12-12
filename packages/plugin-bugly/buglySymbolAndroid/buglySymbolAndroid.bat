@echo off
REM 
REM Copyright 2015-2016 Bugly, Tencent Inc. All rights reserved.
REM 
REM Usage:
REM     buglySymbolAndroid.bat <so_path> [out.zip]
REM 
REM Extract symbols from so file.
REM It call 'buglySymbolAndroid.jar', so make sure there is Java environment on the system.
REM 
REM 

goto main

:printIndroduction
echo Bugly符号表工具Android版 -- Bugly Symtab Tool for Android
echo 适用平台 -- Applicable platform: Windows
echo Copyright 2015-2016 Bugly, Tencent Inc. All rights reserved.
echo.
goto :EOF

:printUsage
echo ----
echo %1
echo ----
echo 用法 -- Usage: buglySymbolAndroid.bat ^<so_path^> [out.zip]
echo.
echo 参数说明 -- Introduction for arguments
echo ^<so_path^>：
echo 	SO文件路径名 -- Path where so file exist
echo.
echo [out.zip] (可选 -- Optional)：
echo 	输出文件名 -- Zip file name for output
echo 	如果[out.zip]不是绝对路径名，[out.zip]将生成在脚本所在目录
echo 	-- If it's not a absolute path, the [out.zip] will be generated into the directory of the script.
goto :EOF

:extractSymbol
java -Xms512m -Xmx1024m -Dfile.encoding=UTF8 -jar %jarPath% %*
goto :EOF

:main
call :printIndroduction

REM Check Java environment
java -version >nul 2>&1
if not %errorlevel%==0 (
	echo ----
	echo 系统中未安装Java或者未配置Java环境，请检查！-- Please check if your system has installed Java or configured environment for Java!
	echo Java官网 -- Java Web Site：www.java.com
	goto end
)

set pathName=%~dp0
set jarName=buglySymbolAndroid.jar
set jarPath="%pathName%%jarName%"

REM Check the jar
if not exist %JarPath% (
	echo ----
	echo 未找到“%JarName%！”-- Can not find %JarName%
	echo 请将“%JarName%”复制到“%pathName%”中！
	echo -- Please copy %JarName% to %pathName%!
	goto end
)

call :extractSymbol %*

:end
pause
exit /B