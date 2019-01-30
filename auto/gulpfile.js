const gulp = require('gulp');

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const jszip = require('jszip');
const jsBeautifully = require('json-beautifully');
const packagePluginUtil = require('./packagePluginUtil');
const protobuf = require("protobufjs");
const ChildProcess = require("child_process");
const uglifyES = require('uglify-es');
const htmlMinifier = require('html-minifier');

let compressCode = function (jsFile, isMin) {
    if (fs.existsSync(jsFile)) {
        let data = fs.readFileSync(jsFile, 'utf-8');
        let result = uglifyES.minify(data, {
            compress: {
                dead_code: true,// 移除未使用的code
                drop_console: true,//丢弃console代码,默认false
                drop_debugger: true,//丢弃debugger代码,默认true
            },
            output: {
                // comments: false,
            }
        });
        if (result.error) {
            // console.log("❎压缩出现错误: " + result.error.message);
            // console.log("❎发生错误的文件: " + jsFile);
            return false;
        } else {
            if (isMin) {
                let file = path.basenameNoExt(jsFile);
                file += ".min.js";
                fs.writeFileSync(file, result.code);
            } else {
                fs.writeFileSync(jsFile, result.code);
            }
            return true;
        }
    } else {
        console.log("文件不存在:" + jsFile);
        return false;
    }
};


let packagePlugin = function (pluginDirName) {
    let projectRootPath = path.join(__dirname, "../");// 项目根目录
    let projectPackagePath = path.join(projectRootPath, 'packages');// 项目插件根目录
    let pluginOutPath = path.join(projectRootPath, 'out');// 插件输出目录
    let pluginTmpPath = path.join(pluginOutPath, pluginDirName);// 插件输出目录
    let packageDirPath = path.join(projectPackagePath, pluginDirName);// 插件根目录

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
    // 清空临时目录
    fse.emptyDirSync(pluginTmpPath);
    // 可以在第三个参数,过滤掉不需要拷贝的文件
    // filter <Function>: Function to filter copied files. Return true to include, false to exclude.
    fse.copySync(packageDirPath, pluginTmpPath);
    console.log("✅[拷贝] 拷贝插件到输出目录成功: " + pluginTmpPath);
    // 删除掉package-lock.json
    debugger
    let delFiles = ["package-lock.json", "README.md"];
    for (let i = 0; i < delFiles.length; i++) {
        let packageLocalFilePath = path.join(pluginTmpPath, delFiles[i]);
        if (fs.existsSync(packageLocalFilePath)) {
            fs.unlinkSync(packageLocalFilePath);
            console.log("✅[删除] 文件: " + packageLocalFilePath);
        }
    }

    // 修改插件必要的配置package.json,
    let pluginTmpPackageCfgPath = path.join(pluginTmpPath, "package.json");// 插件临时配置文件路径
    if (!fs.existsSync(pluginTmpPackageCfgPath)) {
        console.error("[ERROR] 没有发现配置的临时文件: " + pluginTmpPackageCfgPath);
        return;
    }
    let cfgData = fs.readFileSync(pluginTmpPackageCfgPath, 'utf-8');
    let json = JSON.parse(cfgData);
    // 删除无用的menu
    let menus = json['main-menu'];
    if (menus) {
        for (let key in menus) {
            let item = menus[key];
            if (item && item.del) {
                delete menus[key];
            }
        }
        console.log("✅[丢弃] 无用menus");
    }
    // 删除dependencies
    let dependencies = json['dependencies'];
    if (dependencies) {
        delete json['dependencies'];
        console.log("✅[丢弃] 无用dependencies");
    }

    // 删除devDependencies
    let devDependencies = json["devDependencies"];
    if (devDependencies) {
        delete json['devDependencies'];
        console.log("✅[丢弃] 无用devDependencies");
    }

    let str = JSON.stringify(json);
    // str = jsBeautifully(str);// 格式化json
    fs.writeFileSync(pluginTmpPackageCfgPath, str);

    console.log('✅[修改] 写入新的临时配置package.json完毕!');


    // 压缩js
    const globby = require('globby');
    let pattern1 = pluginTmpPath + "/**/*.js";
    let exclude = "!" + pluginTmpPath + "/node_modules/**/*";
    let paths = globby.sync([pattern1, exclude]);
    for (let i = 0; i < paths.length; i++) {
        let item = paths[i];
        let b = compressCode(item, false);
        if (b) {
            console.log(`✅[压缩] 成功(JS)[${i + 1}/${paths.length}]: ${item}`);
        } else {
            console.log(`❎[压缩] 失败(JS)[${i + 1}/${paths.length}]: ${item}`);
        }
    }

    // 压缩html,css
    let pattern2 = pluginTmpPath + "/**/*.html";
    let pattern3 = pluginTmpPath + "/**/*.css";
    let paths1 = globby.sync([pattern2, pattern3, exclude]);
    let minify = htmlMinifier.minify;
    for (let i = 0; i < paths1.length; i++) {
        let item = paths1[i];
        let itemData = fs.readFileSync(item, 'utf-8');
        let minifyData = minify(itemData, {
            removeComments: true,// 是否去掉注释
            collapseWhitespace: true,// 是否去掉空格
            minifyJS: false, //是否压缩html里的js（使用uglify-js进行的压缩）
            minifyCSS: false,//是否压缩html里的css（使用clean-css进行的压缩）
        });
        fs.writeFileSync(item, minifyData);
        console.log(`✅[压缩] 成功(HTML)[${i + 1}/${paths1.length}]: ${item}`);
    }
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
};


gulp.task("发布cc-inspector插件", function () {
    packagePlugin('cc-inspector');
});

gulp.task("调试主进程", function () {
    let Path = require("path");
    let creator = null;
    let exec = require('child_process').exec;
    let platform = require('os').platform();
    let projectPath = Path.join(__dirname, "..");
    let port = 4356;
    if (platform === "darwin") {
        creator = "/Applications/CocosCreator_V2.0.1.app/Contents/MacOS/CocosCreator";

    } else {
        creator = "D:\\Develop\\CocosCreator2_0_1\\CocosCreator.exe";
    }
    let cmd = `${creator} --path ${projectPath} --inspect=${port} --nologin`;
    console.log("执行命令: " + cmd);
    let cmdExe = exec(cmd, function (error, stdout, stderr) {
        if (error) {
            console.log(stderr);
            return;
        }
        console.log(stdout);
    });
    cmdExe.stdout.on('data', function (data) {
        console.log(data);
    });
});


gulp.task("同步Excel-Killer代码", function () {
    const plugin_excel_killer = "/Users/xyf/Documents/project/CocosCreatorPlugins/packages/excel-killer";
    let packagesRootDir = path.join(__dirname, "packages/");
    if (!fs.existsSync(packagesRootDir)) {
        console.log("不存在插件目录:" + packagesRootDir);
        return;
    }

    let excel_killer_dir = path.join(packagesRootDir, "excel-killer");
    if (!fs.existsSync(excel_killer_dir)) {
        console.log("不存在插件目录: " + excel_killer_dir);
        fs.mkdirSync(excel_killer_dir);
    }
    let opt = {
        filter: function (a, b, c) {
            debugger;
        }
    };
    fse.copySync(plugin_excel_killer, excel_killer_dir);
    console.log("同步插件完成!");
});


 

gulp.task("发布Proto", function () {
    // let protobufCli = require("protobufjs/cli");
    // let pbjs = protobufCli.pbjs.main;
    // pbjs({}, function () {
    //
    // });

    let protoDir = path.join(__dirname, "../assets/subpack/module/proto/proto.js");
    let protoSource = path.join(__dirname, "proto/*.proto");
    let cmd = `pbjs -t static-module -w commonjs -m true -o ${protoDir} ${protoSource}`;
    console.log("cmd: " + cmd);
    let exec = ChildProcess.exec(cmd, function (error, stdout, stderror) {
        if (error) {
            console.log(stderror);
        } else {
            console.log(stdout);
        }
    });
    exec.stdout.on('data', function (data) {
        console.log(data);

    });
    exec.stderr.on('data', function (data) {
        console.log(data);
    });
    exec.on('close', function (code) {
        console.log("执行完毕");

    });

    let server = path.join(__dirname, "../server/proto/proto.js");
    let cmd1 = `pbjs -t static-module -w commonjs -m true -o ${server} ${protoSource}`;
    ChildProcess.exec(cmd1)
})
