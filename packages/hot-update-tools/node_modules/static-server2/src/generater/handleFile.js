let path = require('path')
let fs = require('fs')
function handleFile(req, res, fields, files, filepath) {
    //获取文件名
    let name = fields.filename[0]
    //文件读取路径
    let rdPath = files.filechunk[0].path
    //文件写入路径
    let wsPath = path.join(filepath, name)
    //通过range判断上传文件的位置
    let range = req.headers['range']
    let start = 0
    if (range) {
        start = range.split('=')[1].split('-')[0]
    }
    //从multiparty插件中读取文件内容，然后写入本地文件
    let buf = fs.readFileSync(rdPath)
    fs.exists(wsPath, function (exists) {
        //如果是初次上传，删除public下的同名文件
        if (exists && start == 0) {
            fs.unlink(wsPath, function () {
                fs.writeFileSync(wsPath, buf, { flag: 'a+' })
                res.end()
            })
        } else {
            fs.writeFileSync(wsPath, buf, { flag: 'a+' })
            res.end()
        }
    })

}

module.exports = handleFile