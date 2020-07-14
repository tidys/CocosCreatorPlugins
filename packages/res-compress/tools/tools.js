const Path = require('path');
const ChildProcess = require('child_process');

module.exports = {
    dir: Editor.url('packages://res-compress/tools'),
    lame: null,
    jpegtran: null,
    pngquant: null,

    init () {
        this.lame = this._lame();
        this.jpegtran = this._jpegtran();
        this.pngquant = this._pngquant();
    },
    // 设置运行权限
    setRunAuthority (file) {
        let cmd = `chmod u+x ${file}`;
        ChildProcess.exec(cmd, null, (err) => {
            if (err) {
                console.log(err);
            }
            //console.log("添加执行权限成功");
        });
    },
    _lame () {
        if (this.lame === null) {
            let url = null;
            if (process.platform === "darwin") {
                url = Path.join(this.dir, 'lame/lame');
                this.setRunAuthority(url)
            } else {
                url = Path.join(this.dir, 'lame/lame.exe');
            }
            this.lame = url;
        }
        return this.lame;
    },
    _jpegtran () {
        if (this.jpegtran === null) {
            let url = null;
            if (process.platform === 'darwin') {
                url = Path.join(this.dir, 'jpegtran/jpegtran');
                this.setRunAuthority(url)
            } else if (process.platform === 'win32') {
                // Possible values are: 'arm', 'arm64', 'ia32', 'mips','mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'
                if (process.arch === 'x64') {
                    url = Path.join(this.dir, 'jpegtran/win/x64/jpegtran.exe');
                } else if (process.arch === '') {
                    url = Path.join(this.dir, 'jpegtran/win/x86/jpegtran.exe');
                }
            }
            this.jpegtran = url;
        }
        return this.jpegtran;
    },
    _pngquant () {
        if (this.pngquant === null) {
            let url = null;
            if (process.platform === 'darwin') {
                url = Path.join(this.dir, 'pngquant/pngquant')
                this.setRunAuthority(url)
            } else {
                url = Path.join(this.dir, 'pngquant/pngquant.exe')
            }
            this.pngquant = url;
        }
        return this.pngquant;
    }
}
