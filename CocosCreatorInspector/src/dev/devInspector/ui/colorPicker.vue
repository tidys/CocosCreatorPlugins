<template lang="html">
  <div class="m-colorPicker" ref="colorPicker" v-on:click="event => { event.stopPropagation() }">
    <!-- 颜色显示小方块 -->
    <div class="colorBtn"
      v-bind:style="`background-color: ${showColor}`"
      v-on:click="openStatus = !disabled"
      v-bind:class="{ disabled: disabled }"
    ></div>
    <!-- 用以激活HTML5颜色面板 -->
    <input type="color"
      ref="html5Color"
      v-model="html5Color"
      v-on:change="updataValue(html5Color)">
    <!-- 颜色色盘 -->
    <div class="box" v-bind:class="{ open: openStatus }">
      <div class="hd">
        <div class="colorView" v-bind:style="`background-color: ${showPanelColor}`"></div>
        <div class="defaultColor"
          v-on:click="handleDefaultColor"
          v-on:mouseover="hoveColor = defaultColor"
          v-on:mouseout="hoveColor = null"
        >默认颜色</div>
      </div>
      <div class="bd">
        <h3>主题颜色</h3>
        <ul class="tColor">
          <li
            v-for="color of tColor"
            v-bind:style="{ backgroundColor: color }"
            v-on:mouseover="hoveColor = color"
            v-on:mouseout="hoveColor = null"
            v-on:click="updataValue(color)"
          ></li>
        </ul>
        <ul class="bColor">
          <li v-for="item of colorPanel">
            <ul>
              <li
                v-for="color of item"
                v-bind:style="{ backgroundColor: color }"
                v-on:mouseover="hoveColor = color"
                v-on:mouseout="hoveColor = null"
                v-on:click="updataValue(color)"
              ></li>
            </ul>
          </li>
        </ul>
        <h3>标准颜色</h3>
        <ul class="tColor">
          <li
            v-for="color of bColor"
            v-bind:style="{ backgroundColor: color }"
            v-on:mouseover="hoveColor = color"
            v-on:mouseout="hoveColor = null"
            v-on:click="updataValue(color)"
          ></li>
        </ul>
        <h3 v-on:click="triggerHtml5Color">更多颜色...</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'colorPicker',
  props: {
    // 当前颜色值
    value: {
      type: String,
      required: true
    },
    // 默认颜色
    defaultColor: {
      type: String,
      default: '#000'
    },
    // 禁用状态
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // 面板打开状态
      openStatus: false,
      // 鼠标经过的颜色块
      hoveColor: null,
      // 主题颜色
      tColor: ['#000', '#fff', '#eeece1', '#1e497b', '#4e81bb', '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c'],
      // 颜色面板
      colorConfig: [
        ['#7f7f7f', '#f2f2f2'],
        ['#0d0d0d', '#808080'],
        ['#1c1a10', '#ddd8c3'],
        ['#0e243d', '#c6d9f0'],
        ['#233f5e', '#dae5f0'],
        ['#632623', '#f2dbdb'],
        ['#4d602c', '#eaf1de'],
        ['#3f3150', '#e6e0ec'],
        ['#1e5867', '#d9eef3'],
        ['#99490f', '#fee9da']
      ],
      // 标准颜色
      bColor: ['#c21401', '#ff1e02', '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d'],
      html5Color: this.value
    }
  },
  computed: {
    // 显示面板颜色
    showPanelColor () {
      if (this.hoveColor) {
        return this.hoveColor
      } else {
        return this.showColor
      }
    },
    // 显示颜色
    showColor () {
      if (this.value) {
        return this.value
      } else {
        return this.defaultColor
      }
    },
    // 颜色面板
    colorPanel () {
      let colorArr = []
      for (let color of this.colorConfig) {
        colorArr.push(this.gradient(color[1], color[0], 5))
      }
      return colorArr
    }
  },
  methods: {
    triggerHtml5Color () {
      this.$refs.html5Color.click()
    },
    // 更新组件的值 value
    updataValue (value) {
      this.$emit('input', value)
      this.$emit('change', value)
      this.openStatus = false
    },
    // 设置默认颜色
    handleDefaultColor () {
      this.updataValue(this.defaultColor)
    },
    // 格式化 hex 颜色值
    parseColor (hexStr) {
      if (hexStr.length === 4) {
        hexStr = '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3]
      } else {
        return hexStr
      }
    },
    // RGB 颜色 转 HEX 颜色
    rgbToHex (r, g, b) {
      let hex = ((r << 16) | (g << 8) | b).toString(16)
      return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex
    },
    // HEX 转 RGB 颜色
    hexToRgb (hex) {
      hex = this.parseColor(hex)
      let rgb = []
      for (let i = 1; i < 7; i += 2) {
        rgb.push(parseInt('0x' + hex.slice(i, i + 2)))
      }
      return rgb
    },
    // 计算渐变过渡颜色
    gradient (startColor, endColor, step) {
      // 讲 hex 转换为 rgb
      let sColor = this.hexToRgb(startColor)
      let eColor = this.hexToRgb(endColor)

      // 计算R\G\B每一步的差值
      let rStep = (eColor[0] - sColor[0]) / step
      let gStep = (eColor[1] - sColor[1]) / step
      let bStep = (eColor[2] - sColor[2]) / step

      let gradientColorArr = []
      // 计算每一步的hex值
      for (let i = 0; i < step; i++) {
        gradientColorArr.push(this.rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])))
      }
      return gradientColorArr
    }
  },
  mounted () {
    // 点击页面上其他地方，关闭弹窗
    document.onclick = (e) => {
      this.openStatus = false
    }
  }
}
</script>

<style lang="scss" scoped>
.m-colorPicker{
  position: relative; text-align: left; font-size: 14px; display: inline-block;
  ul,li,ol{ list-style: none; margin: 0; padding: 0; }
  input{ display: none; }
  .colorBtn{ width: 15px; height: 15px; }
  .colorBtn.disabled{ cursor: no-drop; }
  .box{
    position: absolute; width: 190px; background: #fff; border: 1px solid #ddd; visibility: hidden; border-radius: 2px; margin-top: 2px; padding: 10px; padding-bottom: 5px; box-shadow: 0 0 5px rgba(0,0,0,.15); opacity: 0; transition: all .3s ease;
    h3{ margin: 0; font-size: 14px; font-weight: normal; margin-top: 10px; margin-bottom: 5px; line-height: 1; }
  }
  .box.open{ visibility: visible; opacity: 1; }
  .hd{
    overflow: hidden; line-height: 29px;
    .colorView{ width: 100px; height: 30px; float: left; transition: background-color .3s ease; }
    .defaultColor{ width: 80px; float: right; text-align: center; border: 1px solid #ddd; cursor: pointer; }
  }
  .tColor{
    li{ width: 15px; height: 15px; display: inline-block; margin: 0 2px; transition: all .3s ease; }
    li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
  }
  .bColor{
    li{
      width: 15px; display: inline-block; margin: 0 2px;
      li{ display: block; width: 15px; height: 15px; transition: all .3s ease; margin: 0; }
      li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
    }
  }
}
</style>
