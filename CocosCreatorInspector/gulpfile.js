let gulp = require('gulp');
let path = require('path');
let fse = require('fs-extra');
let fs = require('fs');
let shell = require('gulp-shell');

gulp.task("packageCrx", function () {
  let pem = path.join(__dirname, "bin/dist.pem");
  if (!fs.existsSync(pem)) {
    console.log("签名文件不存在:" + pem);
    return;
  }
  let dist = path.join(__dirname, "dist");
  let exec = require('child_process').exec;
  let packageCmd = "chrome.exe --pack-extension=" + dist + " --pack-extension-key=" + pem;
  console.log("------------------------------------------------");
  console.log("执行打包命令:\n " + packageCmd);
  console.log("------------------------------------------------");
  let ret = exec(packageCmd);
  ret.stdout.on('data', function () {
    console.log("data");
  });
  ret.stdout.on('close', function (err, a, b, c) {

    let file = path.join(__dirname, "dist.crx");
    if (fs.existsSync(file)) {
      let desFile = path.join(__dirname, "bin/cc-inspector.crx");
      if (fs.existsSync(desFile)) {
        fse.removeSync(desFile);
      }
      fse.move(file, desFile, function (err) {
        if (!err) {
          console.log("发布插件安装包文件成功!");
          console.log("存放路径: " + desFile);
        } else {
          console.log(err);
        }
      })
    } else {
      console.log("发布失败!");
    }
  });

});
gulp.task("default", function () {
  console.log("hello gulp!");
});
