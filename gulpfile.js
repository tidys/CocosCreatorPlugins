let gulp = require("gulp");
let path = require("path");
let fs = require("fs");
let fs_extra = require("fs-extra");

const plugin_excel_killer = "/Users/xyf/Documents/project/CocosCreatorPlugins/packages/excel-killer";

gulp.task("同步Excel-Killer代码", function () {
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
    fs_extra.copySync(plugin_excel_killer, excel_killer_dir);
    console.log("同步插件完成!");
});