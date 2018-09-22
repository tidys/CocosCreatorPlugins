(function () {
    'use strict';

    require('electron-cookies');

    // init device resolutions
    var devices = [
        { name: 'Apple iPad', width: 1024, height: 768, ratio: 2 },
        { name: 'Apple iPad Mini', width: 1024, height: 768, ratio: 1 },
        { name: 'Apple iPhone 4', width: 320, height: 480, ratio: 2 },
        { name: 'Apple iPhone 5', width: 320, height: 568, ratio: 2 },
        { name: 'Apple iPhone 6', width: 375, height: 667, ratio: 2 },
        { name: 'Apple iPhone 6 Plus', width: 414, height: 736, ratio: 3 },
        { name: 'Goolge Nexus 4', width: 384, height: 640, ratio: 2 },
        { name: 'Goolge Nexus 5', width: 360, height: 640, ratio: 3 },
        { name: 'Goolge Nexus 6', width: 412, height: 732, ratio: 3.5 },
        { name: 'Goolge Nexus 7', width: 960, height: 600, ratio: 2 },
    ];

    function setCSSChecked (element, checked) {
        if (checked) {
            element.classList.add('checked');
        }
        else {
            element.classList.remove('checked');
        }
        return checked;
    }

    function refreshPauseBtnState () {
        if (cc.game.isPaused()) {
            btnPause.style.borderTopRightRadius = '0';
            btnPause.style.borderBottomRightRadius = '0';
            btnStep.style.borderTopLeftRadius = '0';
            btnStep.style.borderBottomLeftRadius = '0';
            btnStep.style.display = '';
            setCSSChecked(btnPause, true);
        }
        else {
            btnPause.style.borderTopRightRadius = '';
            btnPause.style.borderBottomRightRadius = '';
            btnStep.style.borderTopLeftRadius = '';
            btnStep.style.borderBottomLeftRadius = '';
            btnStep.style.display = 'none';
            setCSSChecked(btnPause, false);
        }
    }

    var isMobile = function () {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

    // init toolbar
    // =======================

    var rotated = false;
    // var paused = false;
    var canvas = document.getElementById('GameCanvas');
    var btnRotate = document.getElementById('btn-rotate');
    var optsDevice = document.getElementById('opts-device');
    var optsRenderMode = document.getElementById('opts-render-mode');
    var btnPause = document.getElementById('btn-pause');
    var btnStep = document.getElementById('btn-step');
    var optsDebugMode = document.getElementById('opts-debug-mode');
    var btnShowFPS = document.getElementById('btn-show-fps');
    var inputSetFPS = document.getElementById('input-set-fps');
    var btnReload = document.getElementById('btn-reload');

    devices.forEach( function ( info, idx ) {
        var opt = document.createElement('option');
        opt.value = idx+1;
        opt.text = info.name;
        optsDevice.add( opt, null );
    });

    // coockie
    // =======================
    function setCookie (name, value, days) {
        days = days || 30;              //cookie will be saved for 30 days
        var expires  = new Date();
        expires.setTime(expires.getTime() + days*24*60*60*1000);
        document.cookie = name + '='+ encodeURIComponent(value);// + ';expires=' + expires.toGMTString();
    }

    function getCookie (name) {
        var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
        if(arr !== null) return (arr[2]);
        return null;
    }

    function isFullScreen () {
        var toolbar = document.getElementsByClassName('toolbar')[0];
        return getComputedStyle(toolbar).display === 'none';
    }

    function getEmulatedScreenSize () {
        var w, h;
        var idx = optsDevice.value;
        if ( idx === '0' ) {
            w = _CCSettings.designWidth;
            h = _CCSettings.designHeight;
        }
        else {
            var info = devices[parseInt(idx) - 1];
            w = info.width;
            h = info.height;
        }
        return {
            width: rotated ? h : w,
            height: rotated ? w : h
        };
    }

    function showSplash () {
        var size = isFullScreen() ? document.documentElement.getBoundingClientRect() : getEmulatedScreenSize();

        var splash = document.getElementById('splash');
        var progressBar = splash.querySelector('.progress-bar span');
        splash.style.width = size.width + 'px';
        splash.style.height = size.height + 'px';
        if (size.width < size.height) {
            // portrait
            splash.style.backgroundImage = 'res/splash_portrait.png)';
        }
        splash.style.display = '';
        progressBar.style.width = '0%';

        var div = document.getElementById('GameDiv');
        if (div) {
            div.style.visibility = 'visible';
        }

        if ( !isMobile() ) {
            // make the splash screen in center
            canvas.width = size.width;
            canvas.height = size.height;
        }
    }

    // init options
    function initPreviewOptions () {
        var defaultDevice = getCookie('device');
        var defaultRotate = getCookie('rotate');

        var hasDefaultDevice = defaultDevice !== null;
        var hasDefaultRotate = defaultRotate !== null;

        if (hasDefaultDevice) {
            optsDevice.value = parseInt(defaultDevice);
        }

        if (hasDefaultRotate && defaultRotate === 'true') {
            rotated = !rotated;
            setCSSChecked(btnRotate, rotated);
        }

        optsRenderMode.value = getCookie('renderMode') || '0';
        optsDebugMode.value = getCookie('debugMode') || '1';
        setCSSChecked(btnShowFPS, getCookie('showFPS') === 'true');
        inputSetFPS.value = getCookie('frameRate') || '60';
    }

    function isShowFPS() {
        return Array.prototype.indexOf.call(btnShowFPS.classList, 'checked') !== -1;
    }

    initPreviewOptions();

    window.onload = function () {

        function updateResolution () {
            var size = isFullScreen() ? document.documentElement.getBoundingClientRect() : getEmulatedScreenSize();
            var gameDiv = document.getElementById('GameDiv');
            gameDiv.style.width = size.width + 'px';
            gameDiv.style.height = size.height + 'px';

            cc.view.setCanvasSize(size.width, size.height);
        }

        // init rotate button
        btnRotate.addEventListener('click', function () {
            rotated = !rotated;
            setCSSChecked(btnRotate, rotated);
            setCookie('rotate', rotated.toString());
            updateResolution();
        });

        optsDevice.addEventListener( 'change', function () {
            var idx = optsDevice.value;
            setCookie('device', idx.toString());
            updateResolution();
        });

        // init render modes
        (function () {
            var REFRESH_TIP = ' (Refresh to take effect)';
            var tipAdded = false;
            optsRenderMode.addEventListener('change', function (event) {
                var value = event.target.value;
                setCookie('renderMode', value);
                // display refresh tip
                var current = cc.game.config.renderMode;
                if (!tipAdded && parseInt(value) !== current) {
                    optsRenderMode.children[0].text += REFRESH_TIP;
                    optsRenderMode.children[1].text += REFRESH_TIP;
                    tipAdded = true;
                }
            });
        })();

        // init debug modes
        optsDebugMode.addEventListener('change', function (event) {
            var value = event.target.value;
            setCookie('debugMode', value);
            cc._initDebugSetting(parseInt(value));
        });

        // init pause button
        btnPause.addEventListener('click', function () {
            var shouldPause = !cc.game.isPaused();
            if (shouldPause) {
                cc.game.pause();
            } 
            else {
                cc.game.resume();
            }
            refreshPauseBtnState();
        });

        // init reload button
        btnReload.addEventListener('click', function () {
            window.reloadScene();
        });

        // init step button
        btnStep.addEventListener('click', function () {
            cc.game.step();
        });

        // init show fps, true by default
        btnShowFPS.addEventListener('click', function () {
            var show = !cc.director.isDisplayStats();
            cc.director.setDisplayStats(show);
            setCSSChecked(btnShowFPS, show);
            setCookie('showFPS', show.toString());
        });

        // init set fps
        inputSetFPS.addEventListener('change', function (event) {
            var fps = parseInt(inputSetFPS.value);
            if (isNaN(fps)) {
                fps = 60;
                inputSetFPS.value = fps.toString();
            }
            cc.game.setFrameRate(fps);
            setCookie('frameRate', fps);
        });


        // init engine
        // =======================

        if (isFullScreen()) {
            window.addEventListener('resize', updateResolution);
        }

        var option = {
            id: canvas,
            renderMode: parseInt(optsRenderMode.value),
            debugMode: parseInt(optsDebugMode.value),
            showFPS: isShowFPS(),
            frameRate: parseInt(inputSetFPS.value),
        };


        window.reloadScene = function () {
            const Async = require('async');

            cc.game.pause();

            let AssetOptions;
            Async.series([
                // clear web cache
                function (next) {
                    // var Electron = require('electron'); 
                    // var win = Electron.remote.getCurrentWindow();
                    // win.webContents.session.clearCache(next);
                    next();
                },

                // load CCSettings
                function (next) {
                    qp.loadScript(_Settings.CCSettings, next);
                },

                function (next) {
                    // resize canvas
                    if (!isFullScreen()) {
                        updateResolution();
                    }

                    showSplash();

                    next();
                },

                function (next) {
                    qp.loadPlugins(next);
                },

                function (next) {
                    cc.game._sceneInfos = _CCSettings.scenes;
                    cc.game.collisionMatrix = _CCSettings.collisionMatrix;
                    cc.game.groupList = _CCSettings.groupList;

                    next();
                },

                function (next) {
                    // init assets
                    AssetOptions = {
                        libraryPath: _Settings.libraryPath,
                        rawAssetsBase: _Settings.rawAssetsBase,
                        rawAssets: _CCSettings.rawAssets
                    };
                    cc.AssetLibrary.init(AssetOptions);

                    // clear loader cache
                    // cc.loader.clear();
                    cc.director.reset();
                    cc.loader.releaseAll();

                    // clear persist root nodes
                    let nodes = cc.game._persistRootNodes;
                    for (let name in nodes) {
                        cc.game.removePersistRootNode(nodes[name]);
                    }

                    next();
                },

                function (next) {
                    qp.init();
                    next();
                },

                function (next) {
                    // load stashed scene
                    cc.loader.load(_Settings['preview-scene.json'], function (error, json) {
                        if (error) {
                            cc.error(error.stack);
                            return;
                        }

                        // Loading splash scene
                        var splash = document.getElementById('splash');
                        var progressBar = splash.querySelector('.progress-bar span');

                        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
                            splash.style.display = 'none';
                            checkEmptyScene();
                        });

                        cc.loader.onProgress = function (completedCount, totalCount, item) {
                            var percent = 100 * completedCount / totalCount;
                            if (progressBar) {
                                progressBar.style.width = percent.toFixed(2) + '%';
                            }
                        };

                        cc.AssetLibrary.loadJson(json,
                            function (err, sceneAsset) {
                                if (err) {
                                    cc.error(err.stack);
                                    return;
                                }
                                var scene = sceneAsset.scene;
                                scene._name = sceneAsset._name;
                                cc.director.runSceneImmediate(scene, function () {
                                    cc.game.resume();
                                    cc.director.setDisplayStats( isShowFPS() );
                                });

                                cc.loader.onProgress = null;
                                next();
                            }
                        );
                    });
                }
            ]);
        };

        cc.game.run(option, function () {
            var Path = require('path');
            
            require(Path.join(__dirname, 'scripts/engine.js'));

            reloadScene();

            // purge
            //noinspection JSUnresolvedVariable
            // _CCSettings = undefined;
        });
    };

    function checkEmptyScene () {
        var scene = cc.director.getScene();
        if (scene) {
            if (scene.children.length > 1) {
                return;
            }
            if (scene.children.length === 1) {
                var node = scene.children[0];
                if (node.children.length > 0) {
                    return;
                }
                if (node._components.length > 1) {
                    return;
                }
                if (node._components.length > 0 && !(node._components[0] instanceof cc.Canvas)) {
                    return;
                }
            }
        }
        document.getElementById('bulletin').style.display = 'block';
        document.getElementById('sceneIsEmpty').style.display = 'block';
    }
})();

