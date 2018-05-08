
//原生模块
let http = require('http')
let fs = require('fs')
let path = require('path')
let url = require('url')
let { promisify, inspect } = require('util')
let stat = promisify(fs.stat)
let readdir = promisify(fs.readdir)
let zlib = require('zlib')
//第三方包
let chalk = require('chalk')
let mime = require('mime')
let multiparty = require('multiparty')
//自定义模块
let config = require('./config.js')
let compileHtml = require('./generater/compileHtml.js')
let handleFile = require('./generater/handleFile.js')

class Server {
    constructor(argv) {
        //挂载模版方法
        this.compileHtml = compileHtml()
        //挂在配置，处理默认值
        this.config = Object.assign({}, config, argv)
    }
    //启动http服务器
    start() {
        let server = http.createServer()
        server.on('request', this.request.bind(this))
        server.listen(this.config.port, () => {
            let url = `http://${this.config.host}:${this.config.port}`;
            console.log(`${chalk.blue('server has started at')} ${chalk.green(url)}`);
        })
    }
    //http服务器请求处理函数
    async request(req, res) {
        //处理跨域
        let domain = 'http://' + req.headers['host']
        this.handleOption(req, res, domain)
        if (req.method == 'OPTIONS') {
            return res.end()
        }
        let { pathname } = url.parse(req.url)
        //读文件目录
        let filepath = path.join(this.config.document, pathname)
        //处理分块传输
        if (pathname == '/upfile' && req.method == 'POST') {
            return this.handleChunk(req, res, this.config.document)
        }
        //如果是文件夹，读取文件夹发送目录，不是文件夹返回文件内容
        try {
            let fileStat = await stat(filepath)
            if (fileStat.isDirectory()) {
                let files = await readdir(filepath)
                files = files.map(file => {
                    return {
                        name: file,
                        url: path.join(pathname, file)
                    }
                })
                this.sendDirectory(req, res, filepath, files)
            } else {
                let ifCatch = this.handleCatch(req, res, filepath, fileStat)
                //如果走缓存，则直接返回
                if (ifCatch) return
                this.sendFile(req, res, filepath)
            }
        } catch (err) {
            this.sendError(err, res)
        }
    }
    //处理断点续传
    handleChunk(req, res, filepath) {
        let form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.error('multiparty错误：', err)
            }
            if (files) {
                handleFile(req, res, fields, files, filepath)
            }
        });

    }
    //处理跨域等
    handleOption(req, res, domain) {
        //cors跨域
        res.setHeader('Access-Control-Allow-Origin', domain)
        res.setHeader('Access-Control-Allow-Credentials', true)
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With,Range")
    }
    //缓存处理函数
    handleCatch(req, res, filepath, fileStat) {
        //强制缓存
        res.setHeader('Expries', new Date(Date.now() + 30 * 1000).toGMTString())
        res.setHeader('Catch-Control', 'private,max-age=30')
        //对比缓存
        let ifModifiedSince = req.headers['if-modified-since']
        let ifNoneMatch = req.headers['if-none-match']
        let lastModified = fileStat.ctime.toGMTString()
        let eTag = fileStat.size
        res.setHeader('Last-Modified', lastModified)
        res.setHeader('ETag', eTag)
        //任何一个对比缓存头不匹配，则不走缓存
        if (ifModifiedSince && ifModifiedSince != lastModified) {
            return false
        }
        if (ifNoneMatch && ifNoneMatch != eTag) {
            return false
        }
        //当请求中存在任何一个对比缓存头，则返回304，否则不走缓存
        if (ifModifiedSince || ifNoneMatch) {
            res.writeHead(304)
            res.end()
            return true
        } else {
            return false
        }
    }
    //发送文件夹目录
    sendDirectory(req, res, filepath, files) {
        res.setHeader('Content-Type', 'text/html')
        //用模版引擎编译模版，得到编译后的结果
        let html = this.compileHtml({ title: 'bin2', files })
        res.end(html)
    }
    //发送文件
    sendFile(req, res, filepath) {
        res.setHeader('Content-Type', mime.getType(filepath) + ';charset=utf-8')
        let readStream = fs.createReadStream(filepath)
        //处理压缩
        let zlibStream = this.handleZlib(req, res)
        if (zlibStream) {
            readStream.pipe(zlibStream).pipe(res)
        } else {
            readStream.pipe(res)
        }

    }
    //处理压缩
    handleZlib(req, res) {
        let acceptEncoding = req.headers['accept-encoding']
        if (/\bgzip\b/g.test(acceptEncoding)) {
            res.setHeader('Content-Encoding', 'gzip');
            return zlib.createGzip()
        } else if (/\bdeflate\b/g.test(acceptEncoding)) {
            res.setHeader('Content-Encoding', 'deflate');
            return zlib.createDeflate()
        } else {
            return null
        }
    }
    //错误处理函数
    sendError(err, res) {
        res.statusCode = 500;
        res.end(`${err.toString()}`);
    }
}

module.exports = Server

