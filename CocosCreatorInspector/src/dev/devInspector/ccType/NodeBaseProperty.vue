<template>
  <div id="app">
    <div>
      <ui-prop name="uuid">
        <span> {{itemData.uuid}}</span>
      </ui-prop>
      <ui-prop name="name">
        <span> {{itemData.name}}</span>
      </ui-prop>
      <!--坐标-->
      <ui-prop name="Position">
        <div style="float: left;width: 100%;">
          <ui-prop name="X" style="width: 50%;float: left;">
            <span>{{itemData.x}}</span>
          </ui-prop>
          <ui-prop name="Y" style="width: 50%;float:left;">
            <span>{{itemData.y}}</span>
          </ui-prop>
        </div>
      </ui-prop>
      <!--旋转-->
      <!--rotationX, rotationY暂时舍弃显示-->
      <ui-prop name="Rotation">
        <span> {{itemData.rotation}}</span>
      </ui-prop>
      <!--缩放-->
      <ui-prop name="Scale">
        <div style="float: left;width: 100%;">
          <ui-prop name="X" style="width: 50%;float: left;">
            <span>{{itemData.scaleX}}</span>
          </ui-prop>
          <ui-prop name="Y" style="width: 50%;float:left;">
            <span>{{itemData.scaleY}}</span>
          </ui-prop>
        </div>
      </ui-prop>
      <!--锚点-->
      <ui-prop name="Anchor">
        <div style="float: left;width: 100%;">
          <ui-prop name="X" style="width: 50%;float: left;">
            <span>{{itemData.anchorX}}</span>
          </ui-prop>
          <ui-prop name="Y" style="width: 50%;float:left;">
            <span>{{itemData.anchorY}}</span>
          </ui-prop>
        </div>
      </ui-prop>
      <!--尺寸-->
      <ui-prop name="Size">
        <div style="float: left;width: 100%;">
          <ui-prop name="W" style="width: 50%;float: left;">
            <span>{{itemData.width}}</span>
          </ui-prop>
          <ui-prop name="H" style="width: 50%;float:left;">
            <span>{{itemData.height}}</span>
          </ui-prop>
        </div>
      </ui-prop>
      </ui-prop>
      <!--透明度-->
      <ui-prop name="Opacity">
        <span>{{itemData.opacity}}</span>
      </ui-prop>
      <!--斜切-->
      <ui-prop name="Skew">
        <div style="float: left;width: 100%;">
          <ui-prop name="X" style="width: 50%;float: left;">
            <span>{{itemData.skewX}}</span>
          </ui-prop>
          <ui-prop name="Y" style="width: 50%;float:left;">
            <span>{{itemData.skewY}}</span>
          </ui-prop>
        </div>
      </ui-prop>
    </div>
    <ui-prop name="zIndex">
      <span>{{itemData.zIndex}}</span>
    </ui-prop>
    <ui-prop name="childrenCount">
      <span>{{itemData.childrenCount}}</span>
    </ui-prop>
    <!--节点状态-->
    <ui-prop name="active">
      <p v-if="itemData.active" style="margin: 0;display: flex;align-items: center;flex-wrap: wrap;">
        <input type="checkbox"
               style="width: 20px;height: 20px;"
               :checked="itemData.active"
               @click="onBtnClickNodeHide">
        隐藏节点
      </p>

      <p v-if="!itemData.active" style="margin: 0;display: flex;align-items: center;flex-wrap: wrap;">
        <input type="checkbox"
               style="width: 20px;height: 20px;"
               :checked="itemData.active"
               @click="onBtnClickNodeShow"
        >
        显示节点
      </p>
    </ui-prop>
    <!--颜色-->
    <ui-prop name="color">
      <div style="float: left;width: 100%;">
        <div style="float: left;width: 50%;">
          <!--<el-color-picker v-model="itemData.color" disabled style="width: 200px;height: 40px;"></el-color-picker>-->

          <ColorPicker style="width: 20px;height: 20px;z-index: 1000"></ColorPicker>
        </div>
        <div style="float: left;width: 50%;">
          <span>{{itemData.color}}</span>
        </div>
      </div>

    </ui-prop>
  </div>
</template>

<script>


  export default {
    name: "app",
    data() {
      return {}
    },
    methods: {
      onBtnClickNodeHide() {
        let uuid = this.itemData.uuid;
        if (uuid !== undefined) {
          let code = "window.pluginSetNodeActive('" + uuid + "', 0)";
          this._evalCode(code);

          // 刷新节点状态
          let code2 = "window.getNodeInfo('" + uuid + "')";
          this._evalCode(code2);
        }
      },
      onBtnClickNodeShow() {
        let uuid = this.itemData.uuid;
        if (uuid !== undefined) {
          let code = "window.pluginSetNodeActive('" + uuid + "', 1)";
          this._evalCode(code);
          // 刷新节点状态
          let code2 = "window.getNodeInfo('" + uuid + "')";
          this._evalCode(code2);
        }
      },
      _evalCode(code) {
        if (chrome && chrome.devtools) {
          chrome.devtools.inspectedWindow.eval(code);
        } else {
          console.log(code);
        }
      },
    },
    props: [
      'itemData'
    ]
  }
</script>

<style scoped>
  span {
    color: #fd942b;
  }

  .btnSize {
    padding: 5px 10px;
  }

  .comp {
    border: 2px solid #a1a1a1;
    padding: 5px 5px;
    background: #dddddd;
    width: 100%;
    border-radius: 5px;
    -moz-border-radius: 5px; /* 老的 Firefox */
  }

  .float-left {
    float: left;
  }

  .compBorder {
    border: 1px solid #b3b3b3;
    background: #ffffff
  }
</style>
