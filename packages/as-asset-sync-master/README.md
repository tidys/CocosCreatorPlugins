# as-asset-sync

构建完成后同步资源文件到android studio中, 无需再点击编译

## 安装

下载该仓库解压, 得到插件包, 并拷贝到插件目录

### 全局安装

当你打算将你的扩展应用到所有的 Cocos Creator 项目中，你可以选择将扩展包安装到全局扩展包路径中。根据你的目标平台，全局扩展包路径将会放在：

```
Windows %USERPROFILE%\.CocosCreator\packages
Mac $HOME/.CocosCreator/packages
```

### 单个项目内使用

有时候我们只希望某些扩展功能被应用于指定项目中，这个时候我们可以将扩展包安装到项目的扩展包存放路径上。项目的扩展包路径为 `$你的项目地址/packages`

## 使用

安装完后, 无需任何额外操作, 点击构建后会自动完成工作.

[cocos 官方文档](http://www.cocos.com/docs/creator/extension/install-and-share.html)