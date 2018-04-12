'use strict';

const Fs = require('fs');
const Path = require('path');
const Scene = Editor.require('packages://resource/panel/scene');

var PATH = {
    html: Editor.url('packages://resource/panel/panel.html'),
    style: Editor.url('packages://resource/panel/less.css')
};

var createVM = function (elem) {
    return new Vue({
        el: elem,
        data: {
            uuid: '',
            nodeId: null,
            items: []
        },
        watch: {
            uuid () {
                this.refresh();
            }
        },
        methods: {
            refresh () {
                this.nodeId = null;
                var uuid = this.uuid;
                var items = this.items = [];
                Editor.assetdb.queryAssets(null, 'scene', function (err, scenes) {
                    scenes.forEach(function (scene) {
                        var paths = Scene.search(scene, uuid);
                        if (paths.length > 0) {
                            paths.forEach(function (item) {
                                items.push({
                                    scene: Path.basename(scene.path),
                                    path: item.path,
                                    uuid: scene.uuid,
                                    nodeId: item.uuid
                                });
                            });
                        }
                    });
                });
            },
            jumpRes (uuid) {
                Editor.Ipc.sendToAll('assets:hint', uuid);
            },
            jumpScene (uuid, nodeId) {
                this.nodeId = nodeId;
                Editor.Ipc.sendToMain('scene:open-by-uuid', uuid);
            }
        }
    });
};

Editor.Panel.extend({
    template: Fs.readFileSync(PATH.html, 'utf-8'),
    style: Fs.readFileSync(PATH.style, 'utf-8'),

    $: {
        'warp': '#warp'
    },

    ready () {
        this.vm = createVM(this.$warp);
    },

    // ipc
    messages: {
        'scene:ready' () {
            var id = this.vm.nodeId;
            if (id) {
                setTimeout(function () {
                    Editor.Selection.select('node', id);
                    Editor.Ipc.sendToAll('hierarchy:hint', id);
                }, 500);
            }
            this.nodeId = null;
        }
    }
});
