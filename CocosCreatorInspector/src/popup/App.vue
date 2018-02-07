<template>
  <div id="app" style="width: auto;">
    <h3>{{title}}</h3>
    <div style="text-align: center;width: 100%; color: #6d6d6d;">
      <span>支持作者</span>
    </div>
    <br/>
    <div style="margin:0 auto;width:100%;">
      <div style="width: 200px; margin: 0 auto;" v-show="isShowMoneyPng">
        <img style="width: 100%;height: auto;" src="static/images/money.jpg">
      </div>
    </div>
    <br/>
    <div id="foot" style="height: 30px;">
      <span style="font-size: 14px;float: left;text-align: center;line-height: 30px;color: #6d6d6d;">联系方式:</span>
      <div style="height: 100%;float: right;margin-right: 10px;">
        <a href="https://github.com/tidys/CocosCreatorPlugins/tree/master/CocosCreatorInspector" target="_blank">
          <img src="static/images/github.png" style="height: 100%;">
        </a>
      </div>
      <div style="height: 100%;float: right;margin-right: 10px;">
        <a href="https://jq.qq.com/?_wv=1027&k=5SdPdy2" target="_blank">
          <img src="static/images/qq.png" style="height: 100%;">
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import 'vue-awesome/icons/flag'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon'

  Vue.component('icon', Icon);

  export default {
    name: "app",
    data() {
      return {
        title: "cc-inspector",
        isShowMoneyPng: true,
      }
    },
    methods: {
      onBtnClickGitHub() {
        console.log("onBtnClickGitHub");
      }
    },
  }
</script>


<style scoped>

</style>
