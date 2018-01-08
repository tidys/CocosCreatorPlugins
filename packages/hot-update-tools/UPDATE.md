## 简介
- 本工具仅仅是对官方的热更新方案的一个可视化解决方案,可以帮助你快速生成project.manifest和version.manifest文件,并且提供了本地测试的一些常用操作
- 使用前请移步官方热更新教程 https://github.com/cocos-creator/tutorial-hot-update

## 使用说明
- 详细的说明使用文档请前往
https://github.com/tidys/CocosCreatorPlugins/tree/master/packages/hot-update-tools

## 帮助 
- 使用过程中如果遇到任何问题,欢迎加入QQ群224756137
## 更新内容
- [2017/06/12]  
    - 修复MD5计算不一致,导致更新失败  
    - 感谢反馈:http://forum.cocos.com/t/bug/47530    
 
- [2017/12/10]  
    - 修复报错: too many open files   
    - 感谢反馈: http://forum.cocos.com/t/1-6-2-too-many-open-files/54221

- [2018/01/04]  
    - 在<生成Manifest配置>中增加了**资源服务器url配置历史**,方便多版本配置 
    - **资源服务器url** 中追加显示version,如果url存在问题,则不显示版本号   
    
- [2018/01/06]
    - 增加功能:如果再次使用工具未构建项目,点击生成的时候,提示构建项目!   
- [2018/01/08]
    - [增加] 生成manifest的同时,在 **项目目录/packVersion** 下生成该版本的热更资源包       