"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const BaumElements = require("./BaumElements");
const OnionRing = require("./OnionRing");
const Path = require("path");
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
            // FIXME
            // cc.Texture2D
            // asset.getTexture().getPixelFormat();asset.getTexture()._texture
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
function assetdbQueryAssetsAsync(pattern, type) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.queryAssets(pattern, type, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
}
function assetdbQueryMetaInfoByUuidAsync(uuid) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.queryMetaInfoByUuid(uuid, (err, metaInfo) => {
            if (err) {
                reject(err);
            }
            resolve(metaInfo);
        });
    });
}
function assetdbsaveMetaAsync(uuid, jsonString) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.saveMeta(uuid, jsonString, (err, meta) => {
            if (err) {
                reject(err);
            }
            resolve(meta);
        });
    });
}
class PrefabCreator {
    constructor(spriteRootPath, fontRootPath, assetPath, prefabUrl) {
        this.spriteRootPath = spriteRootPath;
        this.fontRootPath = fontRootPath;
        this.assetPath = assetPath;
        this.prefabUrl = prefabUrl;
    }
    async Create() {
        let json = JSON.parse(fs.readFileSync(this.assetPath));
        let info = json["info"];
        let canvas = info["canvas"];
        let imageSize = canvas["image"];
        let canvasSize = canvas["size"];
        let baseSize = canvas["base"];
        let layoutUrl = "db://assets/Texture/" + json["root"]["name"];
        // レイアウト位置情報ファイルの置き場所が作られているかをチェック(作られている場合、uuidが付与されているので、uuidがnullなら、まだ作られていないことを意味する)
        let layoutUuid = await assetdbQueryUuidByUrlAsync(layoutUrl);
        if (layoutUuid == null) {
            // まだ作成されていない場合、作成する
            let layoutFolder = await assetdbCreateAsync(layoutUrl);
            console.log(layoutFolder);
        }
        // prefabの置き場所があるかをチェック
        let prefabUuid = await assetdbQueryUuidByUrlAsync(this.prefabUrl);
        if (prefabUuid == null) {
            // まだ作成されていない場合、作成する
            let prefabFolder = await assetdbCreateAsync(this.prefabUrl);
            console.log(prefabFolder);
        }
        let renderer = new Renderer(this.spriteRootPath, this.fontRootPath, layoutUrl, new cc.Vec2(imageSize["w"], imageSize["h"]), new cc.Vec2(canvasSize["w"], canvasSize["h"]), new cc.Vec2(baseSize["x"], baseSize["y"]));
        // TEST
        await renderer.LoadAllAssetToCache();
        await renderer.LoadAllFontsToCache();
        let rootElement = BaumElements.ElementFactory.Generate(json["root"], null);
        let root = rootElement.Render(renderer);
        // let spriteFrame = renderer.GetSprite("background");
        // console.log(spriteFrame);
        //
        //
        // console.log(rootElement);
        return root;
    }
}
exports.PrefabCreator = PrefabCreator;
class Renderer {
    get CanvasSize() {
        return this._CanvasSize;
    }
    constructor(spriteRootPath, fontRootPath, assetsUrl, imageSize, canvasSize, basePosition) {
        this.spriteRootPath = spriteRootPath;
        this.fontRootPath = fontRootPath;
        this.assetsUrl = assetsUrl;
        this.imageSize = imageSize;
        this._CanvasSize = canvasSize;
        this.basePosition = basePosition;
        this.assetsCache = {};
        this.fontsCache = {};
    }
    async LoadAssetAtPath(assetPath, type = "sprite-frame") {
        let results = (await assetdbImportAsync([assetPath], this.assetsUrl));
        if (results != null) {
            for (let result of results) {
                if (result["type"] === type) {
                    let asset = await ccLoaderLoadAsync(result["uuid"]);
                    return asset;
                }
            }
        }
    }
    async LoadAllAssetToCache() {
        let pngList = fs.readdirSync(this.spriteRootPath);
        for (let png of pngList) {
            let fullpath = path.join(this.spriteRootPath, png);
            let asset = await this.LoadAssetAtPath(fullpath);
            let metaInfo = await assetdbQueryMetaInfoByUuidAsync(asset["_uuid"]);
            let metaInfoJson = JSON.parse(metaInfo["json"]);
            let rawTextureMetaInfo = await assetdbQueryMetaInfoByUuidAsync(metaInfoJson["rawTextureUuid"]);
            // TEST
            // if (asset["name"] === "listsample_piyoscrollbar_handle") {
            let texture = new OnionRing.Texture2D(rawTextureMetaInfo["assetPath"]);
            let slicedTexture = OnionRing.TextureSlicer.Slice(texture);
            console.log("slicedTexture.Boarder.Left:" +
                slicedTexture.Boarder.Left +
                " slicedTexture.Boarder.Right:" +
                " slicedTexture.Boarder.Top:" +
                slicedTexture.Boarder.Top +
                " slicedTexture.Boarder.Bottom:" +
                slicedTexture.Boarder.Bottom);
            if (slicedTexture.Boarder.Left !== 0 ||
                slicedTexture.Boarder.Right !== 0 ||
                slicedTexture.Boarder.Top !== 0 ||
                slicedTexture.Boarder.Bottom !== 0) {
                metaInfoJson.__name__ = Path.basename(metaInfo["assetPath"], Path.extname(metaInfo["assetPath"]));
                metaInfoJson.__path__ = metaInfo["assetPath"];
                metaInfoJson.__mtime__ = metaInfo["assetMtime"];
                metaInfoJson["borderTop"] = slicedTexture.Boarder.Top;
                metaInfoJson["borderBottom"] = slicedTexture.Boarder.Bottom;
                metaInfoJson["borderLeft"] = slicedTexture.Boarder.Left;
                metaInfoJson["borderRight"] = slicedTexture.Boarder.Right;
                let metaInfoJsonString = JSON.stringify(metaInfoJson);
                let uuid = metaInfoJson["uuid"];
                let meta = await assetdbsaveMetaAsync(uuid, metaInfoJsonString);
                // asset["_uuid"];
                let sf = asset;
                // sf.
                sf.insetTop = slicedTexture.Boarder.Top;
                sf.insetBottom = slicedTexture.Boarder.Bottom;
                sf.insetLeft = slicedTexture.Boarder.Left;
                sf.insetRight = slicedTexture.Boarder.Right;
                // @ts-ignore
                sf._calculateSlicedUV();
            }
            // let device: Device;
            /*
              let gl: WebGLRenderingContext = sf.getTexture()["_texture"]["_device"][
                "_gl"
              ] as WebGLRenderingContext;
              let pixelnum = gl.drawingBufferWidth * gl.drawingBufferHeight;
              let pixels = new Uint32Array(pixelnum);
              let pixelrgba = new Uint8Array(pixelnum * 4);
              gl.readPixels(
                0,
                0,
                gl.drawingBufferWidth,
                gl.drawingBufferHeight,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                pixelrgba
              );
      
              for (let i = 0; i < pixelnum; i++) {
                let red = pixelrgba[i * 4];
                let green = pixelrgba[i * 4 + 1];
                let blue = pixelrgba[i * 4 + 2];
                let alpha = pixelrgba[i * 4 + 3];
                // console.log(red + "," + green + "," + blue + "," + alpha);
                if (alpha !== 0 || red !== 0 || green !== 0 || blue !== 0) {
                  // console.log(alpha);
                }
                // const element = array[index];
              }
              */
            // console.log(gl);
            // }
            this.assetsCache[fullpath] = asset;
        }
        console.log(this.assetsCache);
    }
    async LoadAllFontsToCache() {
        let type = "ttf-font";
        let fontAssets = await assetdbQueryAssetsAsync(this.fontRootPath, type);
        for (let fontAsset of fontAssets) {
            let asset = await ccLoaderLoadAsync(fontAsset["uuid"]);
            this.fontsCache[asset["name"]] = asset;
        }
        console.log(this.fontsCache);
    }
    GetSprite(spriteName) {
        let fullpath = path.join(this.spriteRootPath, spriteName + ".png");
        let asset = this.assetsCache[fullpath];
        let spriteFrame = asset;
        return spriteFrame;
        /*
        let sprite = AssetDatabase.LoadAssetAtPath<Sprite>(fullPath);
        Assert.IsNotNull(
          sprite,
          string.Format(
            '[Baum2] sprite "{0}" is not found fullPath:{1}',
            spriteName,
            fullPath
          )
        );
        return sprite;
        */
    }
    GetFont(fontName) {
        let asset = this.fontsCache[fontName];
        let font = asset;
        return font;
    }
    CalcPosition(position, size = null) {
        if (size == null) {
            let tmp = position.sub(this.basePosition);
            tmp.y *= -1.0;
            return tmp;
        }
        else {
            return this.CalcPosition(position.add(size.mul(0.5)));
        }
    }
}
exports.Renderer = Renderer;
class Area {
    get Avg() {
        return this.Min.add(this.Max).mul(0.5);
    }
    get Center() {
        return this.Min.add(this.Max).mul(0.5);
    }
    get Width() {
        return Math.abs(this.Max.x - this.Min.x);
    }
    get Height() {
        return Math.abs(this.Max.y - this.Min.y);
    }
    get Size() {
        return new cc.Vec2(this.Width, this.Height);
    }
    constructor(min, max) {
        if (min == null) {
            this.Empty = true;
            return;
        }
        if (min instanceof cc.Vec2) {
            this.Min = min;
            this.Max = max;
            this.Empty = false;
        }
    }
    static FromPositionAndSize(position, size) {
        return new Area(position, position.add(size));
    }
    static None() {
        return new Area();
    }
    Merge(other) {
        if (other.Empty)
            return;
        if (this.Empty) {
            this.Min = other.Min;
            this.Max = other.Max;
            this.Empty = false;
            return;
        }
        if (other.Min.x < this.Min.x) {
            this.Min = new cc.Vec2(other.Min.x, this.Min.y);
        }
        if (other.Min.y < this.Min.y) {
            this.Min = new cc.Vec2(this.Min.x, other.Min.y);
        }
        if (other.Max.x > this.Max.x) {
            this.Max = new cc.Vec2(other.Max.x, this.Max.y);
        }
        if (other.Max.y > this.Max.y) {
            this.Max = new cc.Vec2(this.Max.x, other.Max.y);
        }
    }
}
exports.Area = Area;
//# sourceMappingURL=BaumPrefabCreator.js.map