#!/bin/bash
# 
# Copyright 2015-2016 Bugly, Tencent Inc. All rights reserved.
# 
# Usage:
#     buglySymbolAndroid.sh <so_path> [out.zip]
# 
# Extract symbols from so file.
# It call 'buglySymbolAndroid.jar', make sure there is Java environment on the system.
#
#

function printIndroduction {
    echo "Bugly符号表工具Android版 -- Bugly Symtab Tool for Android"
    echo "适用平台 -- Applicable platform: Linux"
    echo "Copyright 2015-2016 Bugly, Tencent Inc. All rights reserved."
    echo ""
}

# function - usage
function printUsage(){
    echo "----"
    echo "$1"
    echo "----"
    echo "用法 -- Usage: buglySymbolAndroid.sh <so_path> [out.zip]"
    echo ""
    echo "参数说明 -- Introduction for arguments"
    echo "<so_path>："
    echo "   SO文件路径名 -- Path where so file exist"
    echo ""
    echo "[out.zip] (可选 -- Optional)："
    echo "   输出文件名 -- Zip file name for output"
    echo "   如果[out.zip]不是绝对路径名，[out.zip]将生成在脚本所在目录"
    echo "   -- If it's not an absolute path, the [out.zip] will be generated into the directory of the script."
    exit 3
}

# function - extract
function extractSymbol() {
    java -Xms512m -Xmx1024m -Dfile.encoding=UTF8 -jar "$JarPath" $*
}

# main
printIndroduction

# Check the Java Environment
CheckJavaVersion=$(java -version 2>&1)
echo "$CheckJavaVersion" | grep -q "Java(TM)"
if [ $? -ne 0 ]
then
    echo "----"
    echo "系统中未安装Java或者未配置Java环境，请检查！-- Please check if your system has installed Java or configured environment for Java!"
    echo "Java官网 -- Java Web Site：www.java.com"
    exit 1
fi

# Check the jar
#ShellDir=$(cd `dirname $0`; pwd)
pathName=$(cd `dirname $0`; pwd)
JarName="buglySymbolAndroid.jar"
JarPath="$pathName/$JarName"
if [ ! -f "$JarPath" ]; then
    echo " ----"
    echo " 未找到\"$JarName\"！-- Can not find \"$JarName\"!"
    echo " 请将\"$JarName\"复制到\"$pathName\"中！"
    echo " -- Please copy \"$JarName\" to \"$pathName\"!"
    exit 2
fi 

# call the function to extract symbols
extractSymbol $*