'use strict';
const Fs = require('fire-fs');
const Path = require('fire-path');
const Async = require('async');
const Del = require('del');

let sharpPath;
if (Editor.dev) {
    sharpPath = 'sharp';
} else {
    sharpPath = Editor.url('unpack://utils/sharp');
}
const Sharp = require(sharpPath);

const dontSelectCorrectAssetMsg = {
    type: 'warning',
    buttons: ['OK'],
    titile: 'Unpack Texture Packer Atlas',
    message: 'Please select a Texture Packer asset at first!',
    defaultId: 0,
    noLink: true
};

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'showPanel'() {
            // Editor.log("showPanel");
            Editor.Panel.open('unpack-textureatlas');
        },
        'unpack'() {
            Editor.Metrics.trackEvent({
                category: 'Packages',
                label: 'unpack-textureatlas',
                action: 'Open By Menu'
            }, null);

            let currentSelection = Editor.Selection.curSelection('asset');
            if (currentSelection.length > 0) {
                let selectionUUid = currentSelection[0];
                let selectionMeta = Editor.assetdb.loadMetaByUuid(selectionUUid);
                let selectionUrl = Editor.assetdb.uuidToUrl(selectionUUid);
                let assetInfo = Editor.assetdb.assetInfoByUuid(selectionUUid);
                const textureAtlasPath = Editor.assetdb.uuidToFspath(selectionMeta.rawTextureUuid);


                if (!textureAtlasPath) {
                    Editor.Dialog.messageBox(dontSelectCorrectAssetMsg);
                    return;
                }
                let textureAtlasSubMetas = selectionMeta.getSubMetas();

                if (assetInfo.type === 'sprite-atlas'
                    && selectionMeta.type === 'Texture Packer'
                    && textureAtlasSubMetas) {

                    let extractedImageSaveFolder = Path.join(Editor.projectPath, 'temp', Path.basenameNoExt(textureAtlasPath) + '_unpack');
                    Fs.mkdirsSync(extractedImageSaveFolder);

                    let spriteFrameNames = Object.keys(textureAtlasSubMetas);
                    Async.forEach(spriteFrameNames, function (spriteFrameName, next) {
                        let spriteFrameObj = textureAtlasSubMetas[spriteFrameName];
                        let isRotated = spriteFrameObj.rotated;
                        let originalSize = cc.size(spriteFrameObj.rawWidth, spriteFrameObj.rawHeight);
                        let rect = cc.rect(spriteFrameObj.trimX, spriteFrameObj.trimY, spriteFrameObj.width, spriteFrameObj.height);
                        let offset = cc.p(spriteFrameObj.offsetX, spriteFrameObj.offsetY);
                        let trimmedLeft = offset.x + (originalSize.width - rect.width) / 2;
                        let trimmedRight = (originalSize.width - rect.width) / 2 - offset.x;
                        let trimmedTop = (originalSize.height - rect.height) / 2 - offset.y;
                        let trimmedBottom = offset.y + (originalSize.height - rect.height) / 2;

                        trimmedLeft = trimmedLeft <= 0 ? 0 : Math.floor(trimmedLeft);
                        trimmedBottom = trimmedBottom <= 0 ? 0 : Math.floor(trimmedBottom);
                        trimmedRight = trimmedRight <= 0 ? 0 : Math.floor(trimmedRight);
                        trimmedTop = trimmedTop <= 0 ? 0 : Math.floor(trimmedTop);

                        let sharpCallback = (err) => {
                            if (err) {
                                Editor.error('Generating ' + spriteFrameName + ' error occurs, details:' + err);
                            }

                            Editor.log(spriteFrameName + ' is generated successfully!');
                            next();
                        };

                        let extractedSmallPngSavePath = Path.join(extractedImageSaveFolder, spriteFrameName);
                        if (isRotated) {
                            Sharp(textureAtlasPath).extract({
                                left: rect.x,
                                top: rect.y,
                                width: rect.height,
                                height: rect.width
                            })
                                .background('rgba(0,0,0,0)')
                                .extend({
                                    top: trimmedTop,
                                    bottom: trimmedBottom,
                                    left: trimmedLeft,
                                    right: trimmedRight
                                })
                                .rotate(270)
                                .toFile(extractedSmallPngSavePath, sharpCallback);

                        } else {
                            Sharp(textureAtlasPath).extract({
                                left: rect.x,
                                top: rect.y,
                                width: rect.width,
                                height: rect.height
                            })
                                .background('rgba(0,0,0,0)')
                                .extend({
                                    top: trimmedTop,
                                    bottom: trimmedBottom,
                                    left: trimmedLeft,
                                    right: trimmedRight
                                })
                                .rotate(0)
                                .toFile(extractedSmallPngSavePath, sharpCallback);
                        }
                    }, () => {
                        Editor.log(`There are ${spriteFrameNames.length} textures are generated!`);
                        //start importing the generated textures folder
                        Editor.Ipc.sendToMain('asset-db:import-assets', [extractedImageSaveFolder], Path.dirname(selectionUrl), true, (err) => {
                            if (err) Editor.log('Importing assets error occurs: details' + err);

                            Del(extractedImageSaveFolder, {force: true});
                        }, -1);

                    }); // end of Async.forEach

                } else {
                    Editor.Dialog.messageBox(dontSelectCorrectAssetMsg);
                }
            } else {
                Editor.Dialog.messageBox(dontSelectCorrectAssetMsg);
            }
        },
    },
};
