<template>
  <div id="app" style="height: 30px;overflow: hidden;width: 100%;">
    <div style="width: 20%;float: left;background-color: #4a4a4a;text-align: left;">
      <span style="line-height: 30px;color: #bdbdbd;font-size: 12px;margin: 3px;" class="font">{{name}}</span>
    </div>
    <div style=" float:left;background-color: #4a4a4a;width: 80%;text-align: left;">
      <div style="line-height: 30px;">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "app",
    data() {
      return {};
    },
    methods: {},
    props: [
      'name',
    ]
  }
</script>

<style scoped>
  .font {
    font-family: BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, 'SourceHanSansCN-Normal', Arial, sans-serif
  }
</style>
