"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const { promisify } = require("util");
// https://docs.cocos2d-x.org/creator/api/en/editor/main/editor.html#editorrequireurl
const PrefabUtils = Editor.require("scene://utils/prefab");
// import * as BaumElements from './BaumElements';
const BaumPrefabCreator = require("./BaumPrefabCreator");
function assetdbImportAsync(paths, url) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.import(paths, url, null, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
}
function ccLoaderLoadAsync(uuid) {
    return new Promise(function (resolve, reject) {
        cc.loader.load({ type: "uuid", uuid: uuid }, null, (err, asset) => {
            if (err) {
                reject(err);
            }
            resolve(asset);
        });
    });
}
function assetdbCreateAsync(url) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.create(url, null, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
}
function assetdbCreateOrSaveAsync(url) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.createOrSave(url, null, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
}
function assetdbQueryPathByUrlAsync(url) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.queryPathByUrl(url, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
}
function assetdbQueryUuidByUrlAsync(url) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.queryUuidByUrl(url, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
}
module.exports = {
    onLoad() {
        console.log("onLoadonLoadonLoad");
    },
    reverseList(nodeObj) {
        let children = nodeObj.children;
        children.reverse();
        children.forEach((value, index) => {
            if (value.children && value.children.length > 0) {
                this.reverseList(children[index]);
            }
        });
    },
    reverseNodeList(list) {
        // ('倒转之前:', JSON.stringify(list));
        // console.log('倒转之前:', list);
        list.reverse();
        list.forEach((value, index) => {
            if (value.children && value.children.length > 0) {
                this.reverseList(list[index]);
            }
        });
        // console.log('倒转之后:', list);
        // Editor.log('倒转之后：', JSON.stringify(list));
    },
    reverseElement(nodeObj) {
        let elements = nodeObj.elements;
        elements.reverse();
        elements.forEach((value, index) => {
            if (value.elements && value.elements.length > 0) {
                this.reverseElement(elements[index]);
            }
        });
    },
    reverseElementList(list) {
        // ('倒转之前:', JSON.stringify(list));
        // console.log('倒转之前:', list);
        list.reverse();
        list.forEach((value, index) => {
            if (value.elements && value.elements.length > 0) {
                this.reverseElement(list[index]);
            }
        });
        // console.log('倒转之后:', list);
        // Editor.log('倒转之后：', JSON.stringify(list));
    },
    mountNode(parentNode, obj) {
        let node = new cc.Node(obj.name);
        console.log("obj.name:", obj.name, ",parentNode name:", parentNode.name);
        /*
            parentNode.addChild(node);
            if (obj.children && obj.children.length > 0) {
                obj.children.forEach((child, index) => {
                    this.mountNode(node, obj.children[index]);
                })
            }
            */
    },
    async mountElement(parentNode, obj, pngFolder, layoutUrl) {
        let node = new cc.Node(obj.name);
        parentNode.addChild(node);
        if (obj.elements && obj.elements.length > 0) {
            obj.elements.forEach((child, index) => {
                this.mountElement(node, obj.elements[index], pngFolder, layoutUrl);
            });
        }
        console.log("obj.name:", obj.name, ",parentNode name:", parentNode.name);
        if (obj.type == "Image") {
            let sprite = node.addComponent(cc.Sprite);
            let fullpath = path.join(pngFolder, obj.image + ".png");
            let results = (await assetdbImportAsync([fullpath], layoutUrl));
            console.log(results);
            if (results != null) {
                for (let index = 0; index < results.length; index++) {
                    const result = results[index];
                    console.log(result);
                    if (result["type"] == "sprite-frame") {
                        let asset = await ccLoaderLoadAsync(result["uuid"]);
                        console.log(asset);
                        sprite.spriteFrame = asset;
                    }
                }
                // results.forEach(function ( result ) {
                //
                /*
                                cc.loader.load({type: "uuid", uuid: result.uuid},null,(err,asset) => {
                                    if (err) {
                                        cc.error(err);
                                        throw new Error("loading error");
                                    }
                                    //sprite.spriteFrame = asset.getSpriteFrame('sheep_run_0');
                                    sprite.spriteFrame = asset;
                                    console.log('obj.name:', obj.name, ',parentNode name:', parentNode.name);
                                });
                                */
                //  }
                // });
            }
        }
        // console.log(assetdbImportAsync);
        /*
            let folderpath = await assetdbQueryPathByUrlAsync('db://assets/testfolder');
            let folderuuidbefore = await assetdbQueryUuidByUrlAsync('db://assets/testfolder');
            let folder = await assetdbCreateAsync('db://assets/testfolder');
            let folderuuidafter = await assetdbQueryUuidByUrlAsync('db://assets/testfolder');
            */

        /*
            Editor.assetdb.import([fullpath], 'db://assets', null, function ( err, results ) {
                results.forEach(function ( result ) {
                    console.log(result );
                    if (result.type == "sprite-frame"){
                        cc.loader.load({type: "uuid", uuid: result.uuid},null,(err,asset) => {
                            if (err) {
                                cc.error(err);
                                throw new Error("loading error");
                            }
                            //sprite.spriteFrame = asset.getSpriteFrame('sheep_run_0');
                            sprite.spriteFrame = asset;
                            console.log('obj.name:', obj.name, ',parentNode name:', parentNode.name);
                        });
                    }
                });
            });
            */
        /*

            console.log('obj.name:', obj.name, ',parentNode name:', parentNode.name);
            */
        // parentNode.addChild(node);
        /*
            var res = cc.loader.getRes("test_assets/atlas", cc.SpriteAtlas);
            var all = cc.loader.getDependsRecursively(res);
            cc.loader.release(all);
            cc.loader.loadRes("test_assets/atlas", cc.SpriteAtlas, (err, atlas) => {
                if (err) {
                    cc.error(err);
                    throw new Error("loading error");
                }
            });
            */
        /*
            cc.loader.loadRes("test_assets/atlas",  function (err, spriteFrame) {
                if (err) {
                    cc.error(err);
                    throw new Error("loading error");
                }

                sprite.spriteFrame = spriteFrame;
            });
            */
    },
    mountList(parentNode, list) {
        list.forEach((item, index) => {
            this.mountNode(parentNode, list[index]);
        });
    },
    mountElementList(parentNode, list, pngFolder, layoutUrl) {
        list.forEach((item, index) => {
            this.mountElement(parentNode, list[index], pngFolder, layoutUrl);
        });
    },
    "create-psd-node": async function (event, argsList) {
        // var psd = PSD.fromFile(argsList[3]);
        // psd.parse();
        let mountName = argsList[1];
        let mountNode;
        let canvas = cc.find("Canvas");
        if (mountName === "Canvas") {
            mountNode = canvas;
        }
        else {
            canvas.children.some((item, index) => {
                if (item.name === mountName) {
                    mountNode = canvas.children[index];
                    return true;
                }
            });
        }
        let pngFolder = argsList[4];
        let layoutPath = argsList[3];
        let fontRootPath = "db://assets/resources/font/*";
        let prefabUrl = "db://assets/Prefab/";
        let creator = new BaumPrefabCreator.PrefabCreator(pngFolder, fontRootPath, layoutPath, prefabUrl);
        let go = await creator.Create();
        if (!mountNode) {

            Editor.error(`没有找到要挂载到的节点:${mountName},本次操作被取消`);
        }
        else {
            // mountNode.addChild(go);
            let prefab = PrefabUtils.createPrefabFrom(go);
            let prefabPath = prefabUrl + prefab.data.name + ".prefab";
            let serializedPrefab = Editor.serialize(prefab);
            Editor.Ipc.sendToMain("scene:create-prefab", prefabPath, serializedPrefab, (e, t) => {
                if (e)
                    return cc.error(e);
            });
            console.log(PrefabUtils);
            console.log(prefab.data.name);
            // cc.Scene.
            // this.mountElementList(rootNode, elements, pngFolder, layoutUrl);
        }
        if (event.reply) {
            event.reply(canvas.children.length);
        }
        return;
        /*

        let layout = JSON.parse(fs.readFileSync(layoutPath));
        let layoutUrl = "db://assets/Texture/" + layout["root"]["name"];
        // レイアウト位置情報ファイルの置き場所が作られているかをチェック(作られている場合、uuidが付与されているので、uuidがnullなら、まだ作られていないことを意味する)
        let layoutUuid = await assetdbQueryUuidByUrlAsync(layoutUrl);
        if (layoutUuid == null) {
          // まだ作成されていない場合、作成する
          let layoutFolder = await assetdbCreateAsync(layoutUrl);
          console.log(layoutFolder);
        }

        let pngList = fs.readdirSync(pngFolder);
        let list = argsList[0];
        let elements = layout.root.elements;

        let reverse = argsList[2];

        Editor.log("mount node name:", mountName);
        console.log("list:", list);
        console.log("elements:", elements);
        console.log(promisify);
        // let node=cc.find('Canvas/Test');
        // this.mountList(node,list);
        if (reverse) {
          this.reverseNodeList(list);
          this.reverseElementList(elements);
        }
        // this.mountList(mountNode, list);
          // node treeのルートnodeを作成
          // let rootNode = new cc.Node(layout["root"]["name"]);
    */
    }
};
//# sourceMappingURL=convert.js.map
