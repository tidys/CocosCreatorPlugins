# 插件说明
快速帮你集成4399原创平台SDK
4399原创平台sdk文档地址 http://www.4399api.com/res/api/html5
# 使用说明
- 参数填写: 游戏名称,游戏ID,游戏宽高 这些参数全部来自游戏管理后台
- 勾选**构建完成后自动添加**,构建web-desktop/web-mobile后插件能够自动添加sdk代码
- 当游戏参数变动时,修改后点击**添加4399SDK**即可更新SDK信息
# 其他说明
在main.js中给window添加了如下函数
```javascript
window.moreGame=function(){
    h5api.moreGame();
};
```
因为4399原创平台必须调用这个接口所以在creator的js中可以这么调用
```javascript
if(window.moreGame){
    window.moreGame();
}
```    
# 说明
使用过程中如果遇到什么问题,请注意日志信息提示,如果还有疑问,欢迎联系QQ774177933