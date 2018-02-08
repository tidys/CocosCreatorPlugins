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
          <ui-prop name="X" style="width: 50%;float: left; cursor: ew-resize;"
                   @movestep="changePositionActionX"
                   step="10">
            <!--<span>{{itemData.x}}</span>-->
            <input class="myInput"
                   @change="changePosition"
                   placeholder="itemData.x"
                   v-model="itemData.x">
          </ui-prop>
          <ui-prop name="Y" style="width: 50%;float:left;cursor: ew-resize;"
                   @movestep="changePositionActionY"
                   step="10">
            <!--<span>{{itemData.y}}</span>-->
            <input class="myInput"
                   @change="changePosition"
                   placeholder="itemData.y"
                   v-model="itemData.y">
          </ui-prop>
        </div>
      </ui-prop>
      <!--旋转-->
      <!--rotationX, rotationY暂时舍弃显示-->
      <ui-prop name="Rotation">
        <span> {{itemData.rotation}}</span>
        <!--<input class="myInput"-->
        <!--@change="changeRotation"-->
        <!--placeholder="itemData.rotation"-->
        <!--v-model="itemData.rotation"-->
        <!--style="width: 98%">-->
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
          <ui-prop name="W" style="width: 50%;float: left;cursor: ew-resize;"
                   @movestep="changeSizeActionWidth"
                   step="10">
            <!--<span>{{itemData.width}}</span>-->
            <input class="myInput"
                   @change="changeSize"
                   placeholder="itemData.width"
                   v-model="itemData.width">
          </ui-prop>
          <ui-prop name="H" style="width: 50%;float:left;cursor: ew-resize;"
                   @movestep="changeSizeActionHeight"
                   step="10">
            <!--<span>{{itemData.height}}</span>-->
            <input class="myInput"
                   @change="changeSize"
                   placeholder="itemData.height"
                   v-model="itemData.height">
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
      <div style="float: left;width: 100%;height: 100%;">
        <div style="float: left;width: 50%; height: 100%;">
          <el-color-picker v-model="itemData.color" size="mini"
                           style="margin: 0;display: flex;align-items: center;flex-wrap: wrap;"
                           @change="changeColor"></el-color-picker>
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
      changeSizeActionWidth(step) {
        let w = parseFloat(this.itemData.width);
        this.itemData.width = w + step;
        this.changeSize();
      },
      changeSizeActionHeight(step) {
        let h = parseFloat(this.itemData.height);
        this.itemData.height = h + step;
        this.changeSize();
      },
      changePositionActionX(step) {
        let x = parseFloat(this.itemData.x);
        this.itemData.x = x + step;
        this.changePosition();
      },
      changePositionActionY(step) {
        let y = parseFloat(this.itemData.y);
        this.itemData.y = y + step;
        this.changePosition();
      },
      changePosition() {
        // console.log("change changePositionX:" + this.itemData.x);
        // console.log("change changePositionY:" + this.itemData.y);
        this._evalCode(
          "window.pluginSetNodePosition(" +
          "'" + this.itemData.uuid + "'," +
          "'" + this.itemData.x + "'," +
          "'" + this.itemData.y + "'" +
          ")");
        this._freshNode();
      },
      changeSize() {
        // console.log("change width:" + this.itemData.width);
        // console.log("change height:" + this.itemData.height);
        this._evalCode(
          "window.pluginSetNodeSize(" +
          "'" + this.itemData.uuid + "'," +
          "'" + this.itemData.width + "'," +
          "'" + this.itemData.height + "'" +
          ")");
        this._freshNode();
      },
      changeRotation() {
        console.log("change rotation:" + this.itemData.rotation);
        this._evalCode(
          "window.pluginSetNodeRotation('" +
          this.itemData.uuid + "','" +
          this.itemData.rotation + "')");
        this._freshNode();
      },
      changeColor() {
        let color = this.itemData.color;
        console.log("color:" + color);
        this._evalCode(
          "window.pluginSetNodeColor('" +
          this.itemData.uuid + "','" +
          color + "');");
        this._freshNode();
      },
      onBtnClickNodeHide() {
        let uuid = this.itemData.uuid;
        if (uuid !== undefined) {
          let code = "window.pluginSetNodeActive('" + uuid + "', 0);";
          this._evalCode(code);
          this._freshNode();
        }
      },
      onBtnClickNodeShow() {
        let uuid = this.itemData.uuid;
        if (uuid !== undefined) {
          let code = "window.pluginSetNodeActive('" + uuid + "', 1);";
          this._evalCode(code);
          this._freshNode();
        }
      },
      _freshNode() {
        let uuid = this.itemData.uuid;
        let code2 = "window.getNodeInfo('" + uuid + "')";
        this._evalCode(code2);
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

  .myInput {
    width: 90%;
    border-radius: 5px;
    color: #fd942b;
  }
</style>
