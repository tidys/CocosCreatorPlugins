<template>
  <div id="app" style="width: 200px;">
    <h3>{{label}}</h3>
    <br/>
    <!--<el-button @click="onBtnClickGitHub">ffffff</el-button>-->
    <div style="height: 20px">
      <a href="https://github.com/tidys/CocosCreatorPlugins/tree/master/CocosCreatorInspector" target="_blank">GitHub开源地址</a>
    </div>
    <br/>
    <div style="height: 50px">
      <a href="https://jq.qq.com/?_wv=1027&k=5SdPdy2" target="_blank">
        点击链接加入群 <br/>
        【CocosCreator插件开发交流】</a>
    </div>
  </div>

</template>

<script>
  export default {
    name: "app",
    data() {
      return {
        label: "Cocos Creator Inspector插件",
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
