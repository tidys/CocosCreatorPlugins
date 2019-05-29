const ChildProcess = require("child_process");

module.exports = {
    execSync(cmd) {
        return ChildProcess.execSync(cmd);
    },
    exec(cmd, callback) {
        let cmdder = ChildProcess.exec(cmd, function (error, stdout, stdError) {
            if (error) {
                // console.log("std-err: " + stdError);
            } else {
                //输出所有的输出
                // console.log("std-out: " + stdout);
            }
        });
        cmdder.stdout.on('data', function (data) {
            console.log(data);
        });
        cmdder.stderr.on('data', function (data) {
            console.error(data);
            callback && callback(data, null);
        });
        cmdder.on('close', function () {
            callback && callback(null);
        });
    }
}