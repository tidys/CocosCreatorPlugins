const lamejs = require('lamejs');
const fs = require('fs');
const co = require('co');
const path = require('path');
const fsEx = require("../fsEx");
require('fs-extra');
let loopDir = fsEx.loopDir;

let toArrayBuffer = function (buf) {
    let ab = new ArrayBuffer(buf.length);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
};

let transform = function (filepath, newPath) {
    let handler = function (resolve, reject) {
        fs.readFile(filepath, (err, data) => {
            if (err) {
                reject();
                return;
            }
            let audioData = toArrayBuffer(data);
            let wav = lamejs.WavHeader.readHeader(new DataView(audioData));
            let samples = new Int16Array(audioData, wav.dataOffset, wav.dataLen / 2);
            let buffers = [];
            let mp3enc = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128);
            let remaining = samples.length;
            let maxSamples = 1152;
            let length = 0;

            for (let i = 0; remaining >= maxSamples; i += maxSamples) {
                let mono = samples.subarray(i, i + maxSamples);
                let mp3buf = mp3enc.encodeBuffer(mono);
                if (mp3buf.length > 0) {
                    length += mp3buf.length;
                    buffers.push(Buffer.from(mp3buf));
                }
                remaining -= maxSamples;
            }
            let d = mp3enc.flush();
            if(d.length > 0){
                length += d.length;
                buffers.push(Buffer.from(d));
            }

            let mp3data = Buffer.concat(buffers, length);

            fs.writeFile(newPath, mp3data, (err) => {
                if (err) {
                    reject();
                    return;
                } 

                resolve();
            });
        });
    };

    return new Promise(handler);
};

let _handler = function *(dir) {
    
    console.log("查找路径",dir);
    let files = [];
    let _f = new Set([".wav",".mp3"]);
    // 遍历目录下所有的音频文件,找出其中的wav和mp3格式
    loopDir(dir,files,_f);
    console.log("共查找出" + files.length +"个音频文件");
    for (let i = 0;i< files.length;i++)
    {
        let filepath = files[i];
        if ( path.extname( filepath ) === ".wav")
        {
            let newPath = filepath.replace("wav","mp3");
            console.log("开始:wav转mp3",filepath);
            yield transform(filepath, newPath);
            console.log("转码mp3成功",newPath);
            fs.unlinkSync(filepath);
            console.log("删除wav",filepath);
            filepath = newPath;
        }
    }
};

let doHandler = function (dir) {
    console.log(dir);
    if (!dir)
    {
        return Promise.reject("dir is null");
    }
    return co.wrap(_handler)(dir);
};

module.exports.transformAudio = doHandler;
