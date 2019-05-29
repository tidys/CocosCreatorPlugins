const Path = require("path");
Editor.Panel.extend({
    style: `
      :host { margin: 5px; }
      h2 { color: #f90; }     
      #image {
        text-align: center;
      }
    `,
    template: `
    <script type="text/javascript" src="../lib/psd.js">console.log('psd.js ok!');Editor.log('psd.js ok!');</script>
      <h2>布局文件的完整路径</h2><input type="file" id="layoutfileElement" value="" />      
      <ui-input style="width: 2000px;" id='layoutPath'  class="huge" placeholder="baum2中输出的布局文件的全局路径。。例：C:\\testcocos\\Sample.psd.baum2\\Sample.layout.txt"></ui-input>
      <br>
      <br>
      <h2>PNG文件夹</h2><input type="file" id="pngfileElement" value="" webkitdirectory />      
      <ui-input style="width: 2000px;" id='pngFolder'  class="huge" placeholder="baum2中输出的PNG文件的文件夹路径。例：C:\\testcocos\\Sample.psd.baum2\\Sample"></ui-input>
      <br>
      <ui-button id="psd_convert_btn">PS_ui_convert</ui-button>
      <br>
      <h2>注意:</h2>  
      <h3>・要使用的字体，请提前<b style="color:black;" id="fontUrl">db://assets/resources/font/</b>就可以了</h3> 
      <h3>・被PNG文件9slice化，结果<b style="color:black;"  id="pngAssetUrl">db://assets/Texture/[PNG文件夹名]</b>”中保存。</h3> 
      <h3>・生成的prefab是<b style="color:black;"  id="prefabUrl">db://assets/Prefab/[PNG文件夹名].prefab</b>”中保存</h3>     
  
    `,
    $: {
        layoutfileElement: "#layoutfileElement",
        pngfileElement: "#pngfileElement",
        layoutPath: "#layoutPath",
        pngFolder: "#pngFolder",
        psd_convert_btn: "#psd_convert_btn",
        fontUrl: "#fontUrl",
        pngAssetUrl: "#pngAssetUrl",
        prefabUrl: "#prefabUrl"
    },
    ready() {
        // @ts-ignore
        Editor.Ipc.sendToMain("psd-convert-to-node:print-text", "psd-convert-to-node ready");
        this.$layoutfileElement.onchange = ev => {
            let layoutfileElement = this.$layoutfileElement;
            this.$layoutPath.value = layoutfileElement.files[0].path;
            let pngAssetUrl = this.$pngAssetUrl;
            console.log(pngAssetUrl);
        };
        this.$pngfileElement.onchange = ev => {
            let pngfileElement = this.$pngfileElement;
            this.$pngFolder.value = pngfileElement.files[0].path;
            let pngAssetUrl = this.$pngAssetUrl;
            let prefabUrl = this.$prefabUrl;
            let basename = Path.basename(pngfileElement.files[0].path, Path.extname(pngfileElement.files[0].path));
            pngAssetUrl.innerText = "db://assets/Texture/" + basename + "/";
            prefabUrl.innerText = "db://assets/Prefab/" + basename + ".prefab";
            console.log(ev);
        };
        this.$psd_convert_btn.addEventListener("confirm", () => {
            let layoutPath = this.$layoutPath.value;
            let pngFolder = this.$pngFolder.value;
            // let nodeName = this.$mountNode.value;
            if (!layoutPath) {
                // @ts-ignore
                Editor.error("请输入布局文件的全部路径");
                return;
            }
            if (!pngFolder) {
                // @ts-ignore
                Editor.error("请输入PNG文件夹的全部路径");
                return;
            }
            // @ts-ignore
            Editor.log("value,layoutPath:", layoutPath);
            // @ts-ignore
            Editor.log("value,pngFolder:", pngFolder);
            // this.$label.innerText = "変換開始," + new Date().valueOf().toString();
            let isReverse = false;
            let isSaveJson = false;
            // @ts-ignore
            Editor.Ipc.sendToMain("psd-convert-to-node:convet-psd-file-by-fullpath", [isReverse, isSaveJson, layoutPath, pngFolder], msg => {
                // @ts-ignore
                Editor.log("从psd转换为节点树，msg:", msg, ",nodeName:", "Canvas");
            }, 1000 * 1000);
        });
    },
    messages: {
        "receive-msg"(ev, text) {
            // @ts-ignore
            Editor.log("PSD2Node面板消息From主进程：", text);
        },
        "get-mount-node-name"(ev) {
            if (ev.reply) {
                ev.reply("Canvas");
            }
        }
    }
});
//# sourceMappingURL=index.js.map
