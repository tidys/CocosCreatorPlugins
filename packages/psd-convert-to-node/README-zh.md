baum2CocosCreator
=====

## 使用该插件之前,您必须先在PhotoShop中安装Baum.js
- Photoshop
<img src="https://user-images.githubusercontent.com/961165/50334464-b9d5e680-054b-11e9-90ce-bfe14518d079.png" width="480">

- CocosCreator
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/baum2cc.png" width="480">

## Setup 

### Photoshop

* 下载 [Baum.js](https://github.com/kyubuns/Baum2/releases)
* 将Baum.js文件复制到`Photoshop/Plugins`
    - Mac OS: 
    
        `Applications\Adobe Photoshop [Photoshop_version]\Presets\Scripts`
    - Windows 32 bit: 
    
        `Program Files (x86)\Adobe\Adobe Photoshop [Photoshop_version]\Presets\Scripts`
        
    - Windows 64 bit: 
    
        `Program Files\Adobe\Adobe Photoshop [Photoshop_version](64 Bit)\Presets\Scripts`

### CocosCreator

### Photoshop上的操作

* 制做psd(参照psd的做法)
* File -> Scripts -> 选择Baum2，选择中间文件的输出地址。

### 在CocosCreator上的操作
* 菜单选择`Packages`=>`PSD2Node面板`。
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/pluginmenu.png" width="480">
* 因为显示进口用面板，所以看了说明操作，最后点击“从PS到UI convert”就可以自动完成prefab。
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/pluginpanel.png" width="480">

### PSD的更新方法

* 以同样的方式生成中间文件后，首先在上述注意点的第二个和第三点处“db://assets/…”删除内容。再一次操作上述面板，点击“从PS到UI convert”。

## PSD的制作

### 基本

基本上PhotoShop上的1层= CocosCreator的1个Node。  
UI的一部分想要动画的时候，请分割PhotoShop上的层。  

### Text

* PhotoShop上的**Text层**在ity上被转换成cc.Label。
* 字体、字体、颜色等信息也将尽可能统一。

### Button

* PhotoShop上的**名称为“Button”的组**将被转换为cc.Button。
* 将设置在这一组中最深处绘画的图像层可点击的范围(UI.Button.TargetGraphic)。

### Slider

* fire Engine.ui.slider将PhotoShop上**的名字命名为“Slider”。
* 在这个组内，成为姓名成为Fill的映像层滑动的图像(UI.Slider.FillRect)。

### Scrollbar

* PhotoShop上的**名称是“Scrollbar”结束的小组**将被转换成cc.Scrollbar。
* 在这个小组内，变成Handle的印象层变成滑动的方向盘(UI.Scrollbar.HandleRect)。

### List

* 把PhotoShop上的**名称为“List”的群组**在Unity上被转换为Baum2.List。
* 在这一组内，Item组和Mask层是必不可少的。
    * Item组内的元素是清单中的一项。
    * Mask层是那列清单上的口罩。
* 详细内容请看样本。

### Pivot

* 只适用于Photoshop上正下方路线的团体。
* 像*@Pivot=TopRight*那样，名字后面可以指定Pivot。

### 不输出层

在层名的开头加上#，就可以创造不被输出的层。

## 开发环境

* Cocos Creator: Cocos Creator v2.1.0
* PhotoShopScript: Adobe PhotoShop CC 2018
