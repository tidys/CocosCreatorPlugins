const Electron = require('electron');
const Path = require('fire-path');
const Fs = require('fire-fs');
const Url = require('url');
const Jade = require('jade');
const Globby = require('globby');
const Del = require('del');
const tmpScriptPath = Path.join(Editor.remote.projectPath, 'temp/cc-inspector-scripts').replace(/\\/g, '/');
const assetPath = Path.join(Editor.remote.projectPath, 'assets').replace(/\\/g, '/');
const Async = require('async');
let compiledJsMap = {};

module.exports = {
    run() {
        debugger;
        let window = Editor.remote.Window.find("Test");
        if (window) {
            window.show();
            window.focus();
        } else {
            window = this._createWin();
            this._genContent(function () {
                let url = Path.join(__dirname, 'src/index.html');
                if (Fs.existsSync(url)) {
                    url = Url.format({pathname: url, protocol: 'file:', slashes: true});
                    console.log("loaded: " + url);
                    window.load(url);
                } else {
                    console.log("加载的网页不存在: " + url);
                }
            });
        }
        return window;
    },
    _getPreviewSize() {
        return {width: 800, height: 1200};
    },
    _createWin() {
        let size = this._getPreviewSize();
        const WinBgColor = '#333333';
        let options = {
            title: 'Preview - ' + Editor.projectInfo.name,
            windowType: 'simple',
            useContentSize: true,
            width: size.width,
            height: size.height,
            webPreferences: {
                webSecurity: false,  // support custom protocols
                devTools: true,
            },
            backgroundColor: WinBgColor,
            save: false,
        };
        let window = new Editor.remote.Window("Test", options);
        window.once('closed', function () {
            Editor.log("窗口关闭!");
        });
        // window.load("http://localhost:7456");
        // window.load("http:www.baidu.com");
        window.nativeWin.setPosition(-1432, 176);
        window.openDevTools({mode: "bottom"});
        return window;
    },
    _genContent(cb) {
        // 生成html
        let jadeHtmlFile = Path.join(__dirname, "template/index.jade");
        if (Fs.existsSync(jadeHtmlFile)) {
            let content = Fs.readFileSync(jadeHtmlFile, 'utf-8');
            let fn = Jade.compile(content, {
                filename: Path.join(__dirname, 'template'),
                pretty: true
            });

            let urlPrefix = `http://localhost:${Editor.remote.PreviewServer.previewPort}`;

            let libraryPath = `${urlPrefix}/res/import`;
            let rawAssetsBase = `${urlPrefix}/res/raw-`;

            content = fn({
                engine: Editor.url('unpack://engine').replace(/\\/g, '/'),
                settings: `${urlPrefix}/settings.js`,
                libraryPath: libraryPath,
                rawAssetsBase: rawAssetsBase,
                previewScene: `${urlPrefix}/preview-scene.json`,
                appPath: Editor.remote.App.path.replace(/\\/g, '/'),
                assetPath: assetPath,
                projectPath: Editor.remote.projectPath.replace(/\\/g, '/'),
                tmpScriptPath: tmpScriptPath
            });
            // console.log(content);
            let des = Path.join(__dirname, "src/index.html");
            if (Fs.existsSync(des)) {
                Fs.writeFileSync(des, content);
                console.log("写入index.html完成!");
            }
        }
        this._genSrcFiles(cb);
    },
    _genSrcFiles(cb) {
        // let path = Path.join(Editor.remote.projectPath, 'out');
        // Del.sync(path);
        // 删除预览临时文件夹
        Del.sync(tmpScriptPath, {force: true});
        let types = [
            '.js',
            '.ts',
            '.coffee'
        ];
        let pattern = types.map(function (extName) {
            return Path.join(assetPath, "**/*" + extName);
        });
        // 对项目资源进行处理
        let paths = Globby.sync(pattern);
        Async.forEach(paths,
            function (path, done) {
                // 将项目资源路径转换到插件临时路径下边
                console.log("deal path: " + path);
                path = Path.normalize(path);
                let relativePath = Path.relative(assetPath, path);
                let dst = Path.join(tmpScriptPath, 'assets', relativePath);
                dst = Path.join(Path.dirname(dst), Path.basenameNoExt(dst) + ".js");
                this._addMetaData(path, dst, false, done);
            }.bind(this),
            function (error) {
                if (error) {
                    Editor.error(error);
                }
                cb();
            }.bind(this));
    },
    _addMetaData(src, dst, reimportScript, cb) {
        let name = Path.basenameNoExt(dst);
        let uuid = Editor.remote.assetdb.fspathToUuid(src) || "";

        if (!compiledJsMap[src]) {
            compiledJsMap[src] = 1;
        }
        let time = compiledJsMap[src]++;
        this._transformJS(src, dst, uuid, reimportScript, time, function (error) {
            if (error) {
                return cb(error);
            }

            let contents = Fs.readFileSync(dst, 'utf8');
            let header;
            if (uuid) {
                const UuidUtils = require(Editor.url('app://editor/share/editor-utils/uuid-utils'));
                uuid = UuidUtils.compressUuid(uuid);
                header = `"use strict";` +
                    `qp._RFpush(module, '${uuid}', '${name}');`;
            }
            else {
                header = `"use strict";` +
                    `qp._RFpush(module, '${name}');`;
            }
            let endsWithNewLine = (contents[contents.length - 1] === '\n' || contents[contents.length - 1] === '\r');

            let footer = "\nqp._RFpop();";
            footer += `\n//# sourceMappingURL=${Path.basenameNoExt(dst)}-${time}.js.map`;

            // let mapPath = dst + '.map';
            // if (Fs.existsSync(mapPath)) {
            //   let json = Fs.readFileSync(mapPath, 'utf8');

            //   let convert = require('convert-source-map');
            //   let mapping = convert.fromJSON(json)
            //     .setProperty('sources', [`${Path.basenameNoExt(src)}-${time}${Path.extname(src)}`])
            //     .toComment();

            //   footer += mapping;
            // }

            let newLineFooter = '\n' + footer;
            contents = header + contents + (endsWithNewLine ? footer : newLineFooter);

            Fs.ensureDirSync(Path.dirname(dst));
            Fs.writeFileSync(dst, contents);

            cb();

        }.bind(this));

    },
    _transformJS(src, dst, uuid, reimportScript, time, cb) {
        let meta = Editor.remote.assetdb.loadMetaByUuid(uuid);
        if (!meta) {
            let error = `load meta for [${src}] failed!`;
            console.log(error);
            return cb(new Error(error));
        }

        function copyDst(cb) {
            let dstDir = Path.dirname(dst);
            if (meta.isPlugin) {
                Fs.copySync(src, dst);
                return cb && cb();
            }

            let dsts = [
                Editor.remote.assetdb._uuidToImportPathNoExt(meta.uuid) + '.js',
                Editor.remote.assetdb._uuidToImportPathNoExt(meta.uuid) + '.js.map',
            ];
            dsts.forEach(function (importPath) {

                let basenameNoExt = Path.basenameNoExt(src);
                let extName = Path.extname(src);

                let importBasename = Path.basename(importPath);
                let importExtName = importBasename.substr(importBasename.indexOf('.'), importBasename.length);

                if (importExtName === '.js.map') {
                    dest = Path.join(dstDir, `${basenameNoExt}-${time}.js.map`);
                    let contents = JSON.parse(Fs.readFileSync(importPath, 'utf8'));

                    contents.sources = [`${basenameNoExt}-${time}${extName}`];
                    contents = JSON.stringify(contents);

                    Fs.writeFileSync(dest, contents);
                } else {
                    dest = Path.join(dstDir, basenameNoExt + importExtName);
                    Fs.copySync(importPath, dest);
                }
            }.bind(this));
            cb();
        }


        if (!reimportScript) {
            copyDst(cb);
        } else {
            meta.import(src, function (error) {
                if (error) {
                    return cb(error);
                }
                copyDst(cb);
            }.bind(this));
        }
    },

};