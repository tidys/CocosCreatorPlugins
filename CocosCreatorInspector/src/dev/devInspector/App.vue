<template>
  <div id="app">
    <el-button type="success" class="el-icon-refresh" size="mini" @click="onBtnClickUpdatePage">刷新</el-button>
    <!--<el-button type="success" size="mini" @click="onTestData">测试</el-button>-->
    <!--<el-button type="success" size="mini" @click="onBtnClickTest">test</el-button>-->
    <div v-show="isShowDebug">
      <el-row>
        <el-col :span="8">
          <div class="grid-content treeList">
            <el-tree :data="treeData"
                     :props="defaultProps"
                     :expand-on-click-node="false"
                     @node-click="handleNodeClick"></el-tree>
          </div>
        </el-col>
        <el-col :span="16">
          <div class="grid-content bg-purple-light treeInfo">
            <NodeBaseProperty v-bind:itemData="treeItemData"></NodeBaseProperty>
            <SceneProperty v-show=" treeItemData.type === 'cc_Scene'"></SceneProperty>
            <ComponentsProperty v-bind:components="treeItemData.components"></ComponentsProperty>
          </div>
        </el-col>
      </el-row>
    </div>
    <div v-show="!isShowDebug">
      未发现cocos creator的游戏!
    </div>
  </div>
</template>

<script>
  import injectScript from '../injectScript.js'

  export default {
    name: "app",
    data() {
      return {
        isShowDebug: false,
        treeItemData: {},
        treeData: [],
        treeDataMap: {},
      }
    },
    created() {
      if (chrome && chrome.extension) {

      } else {
        this.isShowDebug = true;
        this.onTestData();
        return;
      }
      let backgroundPageConnection = chrome.extension.connect({
        name: btoa("for" + String(chrome.devtools.inspectedWindow.tabId))
      });
      backgroundPageConnection.onMessage.addListener(function (message) {
        if (message !== null) {
          let msgType = {
            nodeInfo: 2,//节点信息
            nodeListInfo: 1,// 节点列表信息
            notSupport: 0,// 不支持的游戏
          };
          if (message.type === msgType.nodeListInfo) {// 游戏节点
            this.isShowDebug = true;
            // let str = JSON.stringify(message.msg);
            // console.log("onMessage: " + str);
            this._updateView(message.msg);
          } else if (message.type === msgType.notSupport) {// 不支持调试
            this.isShowDebug = false;
          } else if (message.type === msgType.nodeInfo) {
            this.isShowDebug = true;
            this.treeItemData = message.msg;
          }
        }
      }.bind(this));

      window.addEventListener('message', function (event) {
        console.log("on vue:" + JSON.stringify(event.data));
        console.log("on vue:" + JSON.stringify(event));
      }, false);
    },
    methods: {
      onTestData() {
        let testData = {
          "type": "cc_Node",
          "uuid": "5cUWX4Yh1MipGk+ssnZ/fL",
          "name": "Canvas",
          "x": 960,
          "y": 540.4931506849315,
          "zIndex": 0,
          "childrenCount": 6,
          "children": [],
          "width": 1920,
          "height": 1080.986301369863,
          "color": "#fff85f",
          "opacity": 255,
          "rotation": 0,
          "rotationX": 0,
          "rotationY": 0,
          "anchorX": 0.5,
          "anchorY": 0.5,
          "scaleX": 1,
          "scaleY": 1,
          "skewX": 0,
          "skewY": 0,
          "components": [
            {
              "uuid": "Comp.931",
              "type": "cc_Canvas",
              "name": "Canvas<Canvas>"
            },
            {
              "uuid": "Comp.932",
              "type": "HotUpdateScene",
              "name": "Canvas<HotUpdateScene>"
            }],
          "active": true
        };
        this.treeItemData = testData;
      },
      handleNodeClick(data) {
        // todo 去获取节点信息
        // console.log(data);
        let uuid = data.uuid;
        if (uuid !== undefined) {
          let code = "window.getNodeInfo('" + uuid + "')";
          chrome.devtools.inspectedWindow.eval(code);
        }
      },
      _updateView(data) {
        // 构建树形数据
        this.treeData = [];
        let sceneData = data.scene;
        if (sceneData) {
          // scene info
          let dataRoot = {
            type: sceneData.type, uuid: sceneData.uuid,
            label: sceneData.name, children: []
          };
          this.treeData.push(dataRoot);
          this.handleNodeClick(dataRoot);
          // scene children info
          for (let k in sceneData.children) {
            let itemSceneData = sceneData.children[k];
            // let sceneItem = {uuid: itemSceneData.uuid, label: itemSceneData.name, children: []};
            let sceneItem = {};
            dealChildrenNode(itemSceneData, sceneItem);
            this.treeData[0].children.push(sceneItem);
          }
        }
        // TODO 节点树折叠的问题
        if (JSON.stringify(this.treeData) === "[]") {// 第一次赋值

        } else {// 更新值
        }

        function dealChildrenNode(rootData, obj) {
          obj['data'] = rootData;
          obj['uuid'] = rootData.uuid;
          obj['label'] = rootData.name;
          obj['type'] = rootData.type;
          obj['children'] = [];
          let rootChildren = rootData.children;
          for (let k in rootChildren) {
            let itemData = rootChildren[k];
            let item = {};
            dealChildrenNode(itemData, item);
            obj.children.push(item);
          }
        }
      },
      _getInjectScriptString() {
        let code = injectScript.toString();
        let array = code.split('\n');
        array.splice(0, 1);// 删除开头
        array.splice(-1, 1);// 删除结尾
        let evalCode = "";
        for (let i = 0; i < array.length; i++) {
          evalCode += array[i] + '\n';
        }
        // console.log(evalCode);
        return evalCode;
      },

      onBtnClickUpdatePage() {
        let code = this._getInjectScriptString();
        chrome.devtools.inspectedWindow.eval(code, function () {
          console.log("刷新成功!");
        });
      },
    }
  }
</script>

<style scoped>
  .treeList {
    height: 100%
  }

  .treeInfo {
    height: 100%
  }

  .bg-purple {
    background: #d3dce6;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 20px;
  }

  .bg-purple-light {
    background: #e5e9f2;
  }

  body span h1 h2 h3 {
    font-family: BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, 'SourceHanSansCN-Normal', Arial, sans-serif
  }
</style>
