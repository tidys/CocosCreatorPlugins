#!/usr/bin/env bash
# 获取Shell文件目录, 项目目录
ShellFilePath=$(dirname $0)
cd ${ShellFilePath}
ShellFilePath=$(pwd)
ProjectRootPath=$(dirname ${ShellFilePath})
echo 项目路径: ${ProjectRootPath}

# todo 添加CocosCreator路径到环境变量
export CocosCreator=/Applications/CocosCreator.app/Contents/MacOS/
export PATH=${CocosCreator}:${PATH}

# 编译项目
CocosCreator --path ${ProjectRootPath} --build "platform=web-mobile"
echo ""
echo "构建完成"

# 处理web-mobile
deal_WebMobile(){
    echo "处理[web-mobile]"
    WebMobileDir=${ProjectRootPath}/build/web-mobile
    # TODO 目标文件夹
    HttpServerDir=/Users/cocos/Desktop/1
    if [[ ! -d "${HttpServerDir}" ]]; then
        # mkdir "${HttpServerDir}"
        echo "不存在文件夹: ${HttpServerDir}";
        return -1
    fi

    # 清空目标文件夹
    rm -rf ${HttpServerDir}/*
    # 拷贝文件到指定的目录, 注意文件结尾带上/,否则会拷贝文件夹本身
    cp -r ${WebMobileDir}/ ${HttpServerDir}
    echo "copy from [${WebMobileDir}] to [${HttpServerDir}] done!"
}
#deal_WebMobile

deal_android(){

    echo "android"

}
deal_android




deal_ios(){
    echo ""
}

