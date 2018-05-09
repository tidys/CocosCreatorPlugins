var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
const os = require("os");

const co = require("co");
const fsEx = require("../fsEx");
var spawn = child_process.spawn;
var exec = child_process.exec;

var trace = console.log;

let targetDir = process.argv[2]; // 目标目录

let lame_path = "";

let loopDir = fsEx.loopDir;

function transcodingFile(targetPath, desPath) {
    return child_process.execPromise(`${lame_path} -h ${targetPath} ${desPath}`);
}

child_process.execPromise = function (command, options) {
    let handler = function (resolve, reject) {
        exec(command, options, function (err, stdout, stderr) {
            if (err) {
                reject(err);
                return;
            }
            console.log(stdout);
            resolve();
        })
    };
    return new Promise(handler);
};
// lame -V 0 -q 0 -b 45 -B 80 --abr 64 $input_file $new_file

let _hanlder = function* (dir) {
    trace("查找路径", dir);
    let files = [];
    let _f = new Set([".wav", ".mp3"]);
    // 遍历目录下所有的音频文件,找出其中的wav和mp3格式
    loopDir(dir, files, _f);
    trace("共查找出" + files.length + "个音频文件");
    for (let i = 0; i < files.length; i++) {
        let filepath = files[i];
        if (path.extname(filepath) === ".wav") {
            let newPath = filepath.replace("wav", "mp3");
            trace("开始:wav转mp3", filepath);
            yield child_process.execPromise(`${lame_path} -h ${filepath} ${newPath}`);// 转码mp3
            trace("转码mp3成功", newPath);
            fs.unlinkSync(filepath);
            trace("删除wav", filepath);
            filepath = newPath;
        }
        if (path.extname(filepath) === ".mp3") {
            let nnnpath = path.join(__dirname, "temp_" + i + ".mp3"); // 临时文件
            // 压缩MP3
            yield child_process.execPromise(`${lame_path} -V 0 -q 0 -b 45 -B 80 --abr 64 ${filepath} ${nnnpath}`);
            fs.unlinkSync(filepath);
            fs.renameSync(nnnpath, filepath);
            trace(`${filepath} 压缩成功`);
        }
    }
};

let doHandler = function (dir, isInCreator) {
    if (!lame_path) {
        lame_path = path.join(__dirname, "lame");
    }
    if (!dir) {
        return Promise.reject("dir is null");
    }
    return co.wrap(_hanlder)(dir);
};

if (targetDir) {
    doHandler(targetDir, false).then(function (data) {
        trace(data)
    }).catch(function (err) {
        trace(err);
    })
}
module.exports.setLamePath = function (value) {
    lame_path = value;
    if (os.platform() === "win32") {
        lame_path += "lame.exe";
    } else {
        lame_path += "lame";
    }
};
module.exports.transformAudio = doHandler;


