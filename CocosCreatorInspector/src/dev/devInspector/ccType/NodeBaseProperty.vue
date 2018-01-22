<template>
  <div id="app">
    <div v-if="itemData.uuid!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> uuid</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.uuid}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.name!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> name</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.name}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.x!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> x</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.x}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.y!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> y</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.y}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.zIndex!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> zIndex</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.zIndex}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.childrenCount!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> childrenCount</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.childrenCount}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.width!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> width</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.width}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.height!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> height</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.height}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.active!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> active</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple">
            {{itemData.active}}
            <el-button size="mini" v-show="!itemData.active" @click="onBtnClickNodeShow">显示节点</el-button>
            <el-button size="mini" v-show="itemData.active" @click="onBtnClickNodeHide">隐藏节点</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.color!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> color</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.color}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.opacity!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> opacity</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.opacity}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.rotation!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> rotation</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.rotation}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.rotationX!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> rotationX</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.rotationX}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.rotationY!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> rotationY</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.rotationY}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.anchorX!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> anchorX</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.anchorX}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.anchorY!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> anchorY</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.anchorY}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.scaleX!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> scaleX</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.scaleX}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.scaleY!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> scaleY</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.scaleY}}</div>
        </el-col>
      </el-row>
    </div>

    <div v-if="itemData.skewX!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> skewX</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.skewX}}</div>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemData.skewY!==undefined">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple "> skewY</div>
        </el-col>
        <el-col :span="14">
          <div class="grid-content bg-purple"> {{itemData.skewY}}</div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  export default {
    name: "app",
    data() {
      return {
        label: "node-base",
      }
    },
    methods: {
      onBtnClickNodeHide() {
        let uuid = this.itemData.uuid;
        if (uuid !== undefined) {
          let code = "window.pluginSetNodeActive('" + uuid + "', 0)";
          chrome.devtools.inspectedWindow.eval(code);

          // 刷新节点状态
          let code2 = "window.getNodeInfo('" + uuid + "')";
          chrome.devtools.inspectedWindow.eval(code2);
        }
      },
      onBtnClickNodeShow() {
        let uuid = this.itemData.uuid;
        if (uuid !== undefined) {
          let code = "window.pluginSetNodeActive('" + uuid + "', 1)";
          chrome.devtools.inspectedWindow.eval(code);
          // 刷新节点状态
          let code2 = "window.getNodeInfo('" + uuid + "')";
          chrome.devtools.inspectedWindow.eval(code2);
        }
      }
    },
    props: [
      'itemData'
    ]
  }
</script>

<style scoped>

</style>
