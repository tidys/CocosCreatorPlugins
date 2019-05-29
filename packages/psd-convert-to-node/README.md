baum2CocosCreator
=====

## To use this,you must first install the original Baum.js into Photoshop!

- Photoshop
<img src="https://user-images.githubusercontent.com/961165/50334464-b9d5e680-054b-11e9-90ce-bfe14518d079.png" width="480">

- CocosCreator
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/baum2cc.png" width="480">

## Setup 

### Photoshop

* Download [Baum.js](https://github.com/kyubuns/Baum2/releases)
* Copy to Photoshop/Plugins directory Baum.js
    - Mac OS: Applications\Adobe Photoshop [Photoshop_version]\Presets\Scripts
    - Windows 32 bit: Program Files (x86)\Adobe\Adobe Photoshop [Photoshop_version]\Presets\Scripts
    - Windows 64 bit: Program Files\Adobe\Adobe Photoshop [Photoshop_version](64 Bit)\Presets\Scripts

### CocosCreator

* Clone or Download from https://github.com/chooaya/Baum2CocosCreator 
* if it's a zip file,unzip it,you will find a folder named "psd-convert-to-node"
* remember the path of "psd-convert-to-node",copy it if possible
* start the Cocos Creator and open a project or create a new project
* the click "Extension"→"Create a new extension..."→"For all projects(in user profile folder)",and a dialog box will appear
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/global_plugin_path.png" width="480">
* you can paste the "psd-convert-to-node" folder to appeard dialog box
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/global_plugin_path2.png" width="480">

## How to use

### Photoshop上的操作

* psdを作ります。(psdの作り方参照)
* File -> Scripts -> Baum2を選択し、中間ファイルの出力先を選択します。

### CocosCreator上での操作
* "psd-convert-to-node"が正しい場所にコピーされているなら、CocosCreator起動後、メニューから"Packages"→"PSD2Nodeパネル"選択できます。
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/pluginmenu.png" width="480">
* インポート用のパネルが表示されるので、説明を見て操作し、最後は「PSからUIへconvert」をクリックすれば、自動的にprefabが出来上がります。
<img src="https://github.com/chooaya/Baum2CocosCreator/blob/master/pluginpanel.png" width="480">

### psdの更新方法

* 同じように中間ファイルを生成後、まずは上記の注意の二点目と三点目のところの「db://assets/…」の中身を削除。もう一度上記のパネルで操作し、「PSからUIへconvert」をクリック。

## psdの作り方

### 基本

基本的にPhotoshop上の1レイヤー = Unity上の1GameObjectになります。  
UIの一部をアニメーションさせたい場合などは、Photoshop上のレイヤーを分けておいてください。  

### Text

* Photoshop上の **Textレイヤー** は、Unity上でUnityEngine.UI.Textとして変換されます。
* フォントやフォントサイズ、色などの情報も可能な限りUnity側も同じように設定されます。

### Button

* Photoshop上の **名前が"Button"で終わるグループ** は、Unity上でUnityEngine.UI.Buttonとして変換されます。
* このグループ内で、最も奥に描画されるイメージレイヤーがクリック可能な範囲(UI.Button.TargetGraphic)に設定されます。

### Slider

* Photoshop上の **名前が"Slider"で終わるグループ** は、Unity上でUnityEngine.UI.Sliderとして変換されます。
* このグループ内で、名前がFillになっているイメージレイヤーがスライドするイメージ(UI.Slider.FillRect)になります。

### Scrollbar

* Photoshop上の **名前が"Scrollbar"で終わるグループ** は、Unity上でUnityEngine.UI.Scrollbarとして変換されます。
* このグループ内で、名前がHandleになっているイメージレイヤーがスライドするハンドル(UI.Scrollbar.HandleRect)になります。

### List

* Photoshop上の **名前が"List"で終わるグループ** は、Unity上でBaum2.Listとして変換されます。
* このグループ内には、Itemグループと、Maskレイヤーが必須です。
    * Itemグループ内の要素がリストの1アイテムになります。
    * Maskレイヤーがそのリストにかかるマスクになります。
* 詳しくはサンプルをご覧ください。

### Pivot

* Photoshop上のルート直下にあるグループにのみ使えます。
* 名前の後ろに *@Pivot=TopRight* のようにPivotを指定できます。

### コメントレイヤー

レイヤー名の先頭に#をつけることで、出力されないレイヤーを作ることが出来ます。

## Developed by

* Cocos Creator: Cocos Creator v2.1.0
* PhotoshopScript: Adobe Photoshop CC 2018
