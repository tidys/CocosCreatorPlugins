const gulp = require('gulp');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const jszip = require('jszip');
const jsBeautifully = require('json-beautifully');
const packagePluginUtil = require('./packagePluginUtil');

// 打包目录
let packageDir = function (rootPath, zip) {
    let dir = fs.readdirSync(rootPath);
    for (let i = 0; i < dir.length; i++) {
        let itemDir = dir[i];
        let itemFullPath = path.join(rootPath, itemDir);
        let stat = fs.statSync(itemFullPath);
        if (stat.isFile()) {
            zip.file(itemDir, fs.readFileSync(itemFullPath));
        } else if (stat.isDirectory()) {
            packageDir(itemFullPath, zip.folder(itemDir));
        }
    }
};

// 打包插件
gulp.task('打包插件', function () {
    let pluginDirName = 'avgmaker';// 插件名字
    let projectRootPath = path.join(__dirname, "../");// 项目根目录
    let projectPackagePath = path.join(projectRootPath, 'packages');// 项目插件根目录
    let pluginOutPath = path.join(projectRootPath, 'out');// 插件输出目录
    let pluginTmpPath = path.join(pluginOutPath, pluginDirName);// 插件输出目录
    let packageCfgName = 'package.json';// 插件配置文件名字
    let packageDirPath = path.join(projectPackagePath, pluginDirName);// 插件根目录
    let packageCfgPath = path.join(packageDirPath, packageCfgName);// 插件配置文件路径

    // 创建插件的输出目录
    if (!fs.existsSync(pluginOutPath)) {
        fse.mkdirsSync(pluginOutPath);
    }
    if (!fs.existsSync(pluginTmpPath)) {
        fse.mkdirsSync(pluginTmpPath);
    }
    // 将插件先拷贝到out/pluginTmp目录下
    if (!fs.existsSync(packageDirPath)) {
        console.error("[ERROR] 没有发现插件目录: " + packageDirPath);
        return;
    }

    fse.emptyDirSync(pluginTmpPath);
    fse.copySync(packageDirPath, pluginTmpPath);
    console.log("拷贝插件成功: " + pluginTmpPath);
    // 修改插件必要的配置package.json, 删除无用的menu
    let pluginTmpPackageCfgPath = path.join(pluginTmpPath, packageCfgName);// 插件临时配置文件路径
    if (!fs.existsSync(pluginTmpPackageCfgPath)) {
        console.error("[ERROR] 没有发现配置的临时文件: " + pluginTmpPackageCfgPath);
        return;
    }
    let cfgData = fs.readFileSync(pluginTmpPackageCfgPath, 'utf-8');
    let json = JSON.parse(cfgData);
    let menus = json['main-menu'];
    if (menus) {
        for (let key in menus) {
            let item = menus[key];
            if (item && item.del) {
                delete menus[key];
            }
        }
        let str = JSON.stringify(json);
        let formatData = jsBeautifully(str);

        fs.writeFileSync(pluginTmpPackageCfgPath, formatData);
        console.log('写入新的临时配置package.json完毕!');
    }
    // 拷贝runtime-resource, 拷贝assets/plugin 到 tmp/下
    let runTimeResourcePath = null;// 插件设置的运行时资源路径
    if (json['runtime-resource']) {
        runTimeResourcePath = json['runtime-resource']['path'];
    }
    if (!runTimeResourcePath) {
        console.error("[ERROR] 未发现插件runtime-resource相关配置信息!");
        return;
    }
    let pluginRuntimeDir = path.join(projectRootPath, 'assets/' + runTimeResourcePath);
    if (!fs.existsSync(pluginRuntimeDir)) {
        console.error("[ERROR] 插件的runtime-resource不存在: " + pluginRuntimeDir);
        return;
    }
    let desPluginPath = path.join(pluginTmpPath, runTimeResourcePath);
    if (!fs.existsSync(desPluginPath)) {
        fse.mkdirsSync(desPluginPath);
    }
    fse.copySync(pluginRuntimeDir, desPluginPath);
    console.log("拷贝runtime-resource完成");
    // 拷贝runtime-resource.meta文件
    let metaSrc = pluginRuntimeDir + ".meta";
    if (!fs.existsSync(metaSrc)) {
        console.warn('[WARNING] 不存在runtime-resource.meta文件: ' + metaSrc);
    }
    fse.copyFileSync(metaSrc, desPluginPath + ".meta");
    // 打包插件
    console.log("打包目录: " + pluginTmpPath);
    if (!fs.existsSync(pluginTmpPath)) {
        console.log('[ERROR] 打包目录不存在: ' + pluginTmpPath);
        return;
    }
    let zip = new jszip();
    // 打包插件说明
    let readme = path.join(projectRootPath, "README.md");
    if (fs.existsSync(readme)) {
        zip.file("插件说明.txt", fs.readFileSync(readme));
    }
    // 打包插件源代码
    packageDir(pluginTmpPath, zip.folder(pluginDirName));
    // 创建zip存放目录
    if (!fs.existsSync(pluginOutPath)) {
        fs.mkdirSync(pluginOutPath);
    }
    // 删除旧版本
    let zipFilePath = path.join(pluginOutPath, pluginDirName + "-plugin.zip");
    if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
        console.log("删除旧版本文件:" + zipFilePath);
    }
    // 生成压缩包
    zip.generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true,
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    })
        .pipe(fs.createWriteStream(zipFilePath))
        .on('finish', function () {
            console.log('打包成功: ' + zipFilePath);
            // 删除目录
            fse.removeSync(pluginTmpPath);
            // 在文件夹中展示打包文件
            let exec = require('child_process').exec;

            let platform = require('os').platform();
            if (platform === 'darwin') {
                let cmd = "open " + pluginOutPath;
                console.log('开始执行命令: ' + cmd);
                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        console.log(stderr);
                        return;
                    }
                    console.log(stdout);
                }.bind(this));
            } else if (platform === 'win32') {
                // todo win
            }
        }.bind(this))
        .on('error', function () {
            console.log('打包失败: ' + zipFilePath);
        }.bind(this));
});