const Gulp = require("gulp");
const CocosCreator = "/Applications/CocosCreator.app/Contents/MacOS/CocosCreator";
const ChildProcess = require("child_process");
const Path = require("path");
let projectPath = Path.join(__dirname, "../");
const Util = require("./core/util.js");

Gulp.task("build-ios", function () {
    let configPath = Path.join(__dirname, "build-config/build-ios.json");
    let cmd = `${CocosCreator} --path ${projectPath} --build "configPath=${configPath}"`;
    Util.exec(cmd, function (error) {
        if (error) {

        } else {
            console.log("构建完毕");
        }
    })
});