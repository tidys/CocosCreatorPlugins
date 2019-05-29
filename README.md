# 项目简介
目前包含的免费插件有:  
[热更新插件](packages/hot-update-tools/README.md)  
[Bugly插件](packages/plugin-bugly/README.md)   
[4399原创平台SDK插件](packages/plugin-4399-web-js-sdk/README.md)    
[Cocos-Creator-Inspector](CocosCreatorInspector/README.md)  
[Excel-Killer工具](packages/excel-killer/README.md)    
[贝塞尔编辑工具<有待开发>](packages/bezier/README.md)      
[资源压缩工具](packages/res-compress/README.md)         
[cc-inspector+](doc/cc-inspector-v2/index.md)    
## 克隆慢？
[解决办法](Clone.md)

## 2款收费插件,有需求的支持下呗
- 字体瘦身
    - 购买链接: http://store.cocos.com/stuff/show/178910.html
    - 帮助文档: [点击查看](doc/ttf/README.md)
- BMFont位图字体生成工具
    - 购买链接: http://store.cocos.com/stuff/show/178913.html
    - 帮助文档: [点击查看](doc/bitmap-font/README.md)

# 插件常见问题
## 如何安装从其他地方获取的插件
- 首先你需要确认插件源码是否包含以下最基本的2个文件
    - package.json
    - main.js
- 将下载的插件文件存放在这样的一个目录: **项目目录/packages/插件名字/**
- 如果插件代码没有问题的话,重启creator即可正确加载该插件


## 如何修改插件快捷键
每个插件的源代码都放在项目的packages目录下
```json
      "accelerator": "CmdOrCtrl+Shift+m"
```
如果在插件源码的package.json中定义了accelerator字段,那么插件的快捷键就会生效,如果设置的快捷键和系统快捷键有冲突,那么可以自行修改

## 如何手动安装插件
[点击查看](doc/installPlugin.md)

# 福利代码
项目中的代码是个人开发沉淀,希望对你有所帮助!     
- [Observer.js](assets/subpack/core/Observer.js)
- [ObserverMgr.js](assets/subpack/core/ObserverMgr.js)    
# 支持一下呗
![](CocosCreatorInspector/src/assets/images/money.jpg)
