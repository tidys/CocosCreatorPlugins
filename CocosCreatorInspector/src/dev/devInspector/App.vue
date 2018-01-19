<template>
  <div id="app">
    <el-button type="success" class="el-icon-refresh" size="mini" @click="onBtnClickUpdatePage">刷新</el-button>
    <!--<button @click="onBtnClickCleanInspectorTimer">停止获取</button>-->
    <!--<el-button @click="_updateView">测试</el-button>-->
    <div v-show="isShowDebug">
      <el-row>
        <el-col :span="8">
          <div class="grid-content">
            <el-tree :data="treeData"
                     :props="defaultProps"
                     :expand-on-click-node="false"
                     @node-click="handleNodeClick"></el-tree>
          </div>
        </el-col>
        <el-col :span="16">
          <div class="grid-content bg-purple-light">
            <div v-if="treeItemData.uuid!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> uuid</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.uuid}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>name: {{treeItemData.name}}</div>-->
            <div v-if="treeItemData.name!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> name</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.name}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>x: {{treeItemData.x}}</div>-->
            <div v-if="treeItemData.x!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> x</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.x}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>y: {{treeItemData.y}}</div>-->
            <div v-if="treeItemData.y!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> y</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.y}}</div>
                </el-col>
              </el-row>
            </div>


            <!--<div>zIndex: {{treeItemData.zIndex}}</div>-->
            <div v-if="treeItemData.zIndex!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> zIndex</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.zIndex}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>childrenCount: {{treeItemData.childrenCount}}</div>-->
            <div v-if="treeItemData.childrenCount!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> childrenCount</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.childrenCount}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>width: {{treeItemData.width}}</div>-->
            <div v-if="treeItemData.width!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> width</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.width}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>height:{{treeItemData.height}}</div>-->
            <div v-if="treeItemData.height!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> height</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.height}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>active:{{treeItemData.active}}</div>-->
            <div v-if="treeItemData.active!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> active</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.active}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>color:{{treeItemData.color}}</div>-->
            <div v-if="treeItemData.color!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> color</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.color}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>opacity:{{treeItemData.opacity}}</div>-->
            <div v-if="treeItemData.opacity!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> opacity</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.opacity}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>rotation:{{treeItemData.rotation}}</div>-->
            <div v-if="treeItemData.rotation!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> rotation</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.rotation}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>rotationX:{{treeItemData.rotationX}}</div>-->
            <div v-if="treeItemData.rotationX!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> rotationX</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.rotationX}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>rotationY:{{treeItemData.rotationY}}</div>-->
            <div v-if="treeItemData.rotationY!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> rotationY</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.rotationY}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>anchorX:{{treeItemData.anchorX}}</div>-->
            <div v-if="treeItemData.anchorX!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> anchorX</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.anchorX}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>anchorY:{{treeItemData.anchorY}}</div>-->
            <div v-if="treeItemData.anchorY!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> anchorY</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.anchorY}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>scaleX:{{treeItemData.scaleX}}</div>-->
            <div v-if="treeItemData.scaleX!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> scaleX</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.scaleX}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>scaleY:{{treeItemData.scaleY}}</div>-->
            <div v-if="treeItemData.scaleY!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> scaleY</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.scaleY}}</div>
                </el-col>
              </el-row>
            </div>

            <!--<div>skewX:{{treeItemData.skewX}}</div>-->
            <div v-if="treeItemData.skewX!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> skewX</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.skewX}}</div>
                </el-col>
              </el-row>
            </div>
            <!--<div>skewY:{{treeItemData.skewY}}</div>-->
            <div v-if="treeItemData.skewY!==undefined">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="grid-content bg-purple "> skewY</div>
                </el-col>
                <el-col :span="14">
                  <div class="grid-content bg-purple"> {{treeItemData.skewY}}</div>
                </el-col>
              </el-row>
            </div>
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
        treeData: [
          // {
          //   label: '名字',
          //   data: {test1: 1, test2: 2},
          //   children: [{
          //     label: '二级 1-1',
          //     children: [{
          //       label: '三级 1-1-1'
          //     }]
          //   }]
          // }
        ]
      }
    },
    created() {
      let backgroundPageConnection = chrome.extension.connect({
        name: btoa("for" + String(chrome.devtools.inspectedWindow.tabId))
      });
      backgroundPageConnection.onMessage.addListener(function (message) {
        if (message !== null) {
          if (message.type === 1) {// 游戏节点
            this.isShowDebug = true;
            // let str = JSON.stringify(message.msg);
            // console.log("onMessage: " + str);
            this._updateView(message.msg);
          } else if (message.type === 0) {// 不支持调试
            this.isShowDebug = false;
          }
        }
        // this._log();
        // let btn1 = document.querySelector('#app');
        // console.log(btn1);
      }.bind(this));

      window.addEventListener('message', function (event) {
        console.log("on vue:" + JSON.stringify(event.data));
        console.log("on vue:" + JSON.stringify(event));

      }, false);
    },
    methods: {
      handleNodeClick(data) {
        // console.log(data);
        if (data.data === undefined) {// scene是没有data属性
          this.treeItemData = {};
        } else {
          this.treeItemData = data.data;
        }
      },
      onBtnClickCleanInspectorTimer() {
        let code = "if (window.cocosCreatorInspectorTimer !== undefined) {\n" +
          "  clearInterval(window.cocosCreatorInspectorTimer);\n" +
          "}";
        chrome.devtools.inspectedWindow.eval(code, function () {
          console.log("清理定时器成功!");
        });
      },
      _updateView(data) {
        let testData = {
          "scene": {
            "HotUpdateScene": {
              "name": "HotUpdateScene",
              "children": {
                "Canvas": {
                  "uuid": "5cUWX4Yh1MipGk+ssnZ/fL",
                  "name": "Canvas",
                  "x": 960.48,
                  "y": 540,
                  "zIndex": 0,
                  "childrenCount": 5,
                  "children": {
                    "bg": {
                      "uuid": "2c5fLAERNLC62o2iNykbgx",
                      "name": "bg",
                      "x": 0,
                      "y": 0,
                      "zIndex": 0,
                      "childrenCount": 0,
                      "children": {},
                      "width": 1920,
                      "height": 1080,
                      "active": true,
                      "color": "#ffffff",
                      "opacity": 255,
                      "rotation": 0,
                      "rotationX": 0,
                      "rotationY": 0,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "scaleX": 1,
                      "scaleY": 1,
                      "skewX": 0,
                      "skewY": 0
                    },
                    "addNode": {
                      "uuid": "f2v6in7lhIy7ZS+4Fv0iNZ",
                      "name": "addNode",
                      "x": 0,
                      "y": 0,
                      "zIndex": 0,
                      "childrenCount": 0,
                      "children": {},
                      "width": 0,
                      "height": 0,
                      "active": true,
                      "color": "#ffffff",
                      "opacity": 255,
                      "rotation": 0,
                      "rotationX": 0,
                      "rotationY": 0,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "scaleX": 1,
                      "scaleY": 1,
                      "skewX": 0,
                      "skewY": 0
                    },
                    "New ProgressBar": {
                      "uuid": "96BMjmV0hNBKH/iOLsB8Yu",
                      "name": "New ProgressBar",
                      "x": 0,
                      "y": -435,
                      "zIndex": 0,
                      "childrenCount": 2,
                      "children": {
                        "bar": {
                          "uuid": "43llwfzZJP4Lfjpe4Huoto",
                          "name": "bar",
                          "x": -737.8,
                          "y": 0,
                          "zIndex": 0,
                          "childrenCount": 0,
                          "children": {},
                          "width": 0,
                          "height": 27,
                          "active": true,
                          "color": "#ffffff",
                          "opacity": 255,
                          "rotation": 0,
                          "rotationX": 0,
                          "rotationY": 0,
                          "anchorX": 0,
                          "anchorY": 0.5,
                          "scaleX": 1,
                          "scaleY": 1,
                          "skewX": 0,
                          "skewY": 0
                        },
                        "更新信息提示": {
                          "uuid": "ab78iV9mhGAqI2NkG0RNoh",
                          "name": "更新信息提示",
                          "x": 0,
                          "y": 58,
                          "zIndex": 0,
                          "childrenCount": 0,
                          "children": {},
                          "width": 0,
                          "height": 40,
                          "active": true,
                          "color": "#ffffff",
                          "opacity": 255,
                          "rotation": 0,
                          "rotationX": 0,
                          "rotationY": 0,
                          "anchorX": 0.5,
                          "anchorY": 0.5,
                          "scaleX": 1,
                          "scaleY": 1,
                          "skewX": 0,
                          "skewY": 0
                        }
                      },
                      "width": 1482,
                      "height": 35,
                      "active": true,
                      "color": "#ffffff",
                      "opacity": 255,
                      "rotation": 0,
                      "rotationX": 0,
                      "rotationY": 0,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "scaleX": 1,
                      "scaleY": 1,
                      "skewX": 0,
                      "skewY": 0
                    },
                    "version": {
                      "uuid": "8fCXWu6LRBl4WYBhVxE59j",
                      "name": "version",
                      "x": 953,
                      "y": -511,
                      "zIndex": 0,
                      "childrenCount": 0,
                      "children": {},
                      "width": 0,
                      "height": 40,
                      "active": true,
                      "color": "#ffffff",
                      "opacity": 255,
                      "rotation": 0,
                      "rotationX": 0,
                      "rotationY": 0,
                      "anchorX": 1,
                      "anchorY": 0.5,
                      "scaleX": 1,
                      "scaleY": 1,
                      "skewX": 0,
                      "skewY": 0
                    },
                    "New Button": {
                      "uuid": "28xYSVw6xHwI1fS0jnkDiy",
                      "name": "New Button",
                      "x": 0,
                      "y": 0,
                      "zIndex": 0,
                      "childrenCount": 1,
                      "children": {
                        "Label": {
                          "uuid": "e4D9Xh4a1FPLW523gpDNtK",
                          "name": "Label",
                          "x": 0,
                          "y": 0,
                          "zIndex": 0,
                          "childrenCount": 0,
                          "children": {},
                          "width": 140,
                          "height": 40,
                          "active": true,
                          "color": "#000",
                          "opacity": 255,
                          "rotation": 0,
                          "rotationX": 0,
                          "rotationY": 0,
                          "anchorX": 0.5,
                          "anchorY": 0.5,
                          "scaleX": 1,
                          "scaleY": 1,
                          "skewX": 0,
                          "skewY": 0
                        }
                      },
                      "width": 200,
                      "height": 70,
                      "active": true,
                      "color": "#ffffff",
                      "opacity": 255,
                      "rotation": 0,
                      "rotationX": 0,
                      "rotationY": 0,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "scaleX": 1,
                      "scaleY": 1,
                      "skewX": 0,
                      "skewY": 0
                    }
                  },
                  "width": 1920.96,
                  "height": 1080,
                  "active": true,
                  "color": "#ffffff",
                  "opacity": 255,
                  "rotation": 0,
                  "rotationX": 0,
                  "rotationY": 0,
                  "anchorX": 0.5,
                  "anchorY": 0.5,
                  "scaleX": 1,
                  "scaleY": 1,
                  "skewX": 0,
                  "skewY": 0
                }
              }
            }
          }
        };

        // 构建树形数据
        this.treeData = [];
        let sceneData = data.scene;
        if (sceneData) {
          for (let k in sceneData) {
            let itemSceneData = sceneData[k];
            let sceneItem = {label: itemSceneData.name, children: []};
            dealChildren(itemSceneData, sceneItem);
            this.treeData.push(sceneItem);
          }
        }

        function dealChildren(rootData, obj) {
          let rootChildren = rootData.children;
          for (let k in rootChildren) {
            let itemData = rootChildren[k];
            let item = {label: itemData.name, data: itemData, children: []};
            dealChildren(itemData, item);
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
        // let message = {
        //   action: "script",
        //   content: "util.main.js",
        //   tabId: chrome.devtools.inspectedWindow.tabId
        // };
        // chrome.extension.sendMessage(message);

        let code = this._getInjectScriptString();
        chrome.devtools.inspectedWindow.eval(code, function () {
          console.log("刷新成功!");
        });
      },
      clickCode() {
        console.log("clickCode");
        let message = {
          action: "code",
          content: "console.log(cc)",
          tabId: chrome.devtools.inspectedWindow.tabId
        };
        chrome.extension.sendMessage(message);
      },
    }
  }
</script>

<style scoped>
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
</style>
