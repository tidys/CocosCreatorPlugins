let handlebars = require('handlebars')
let fs = require('fs')
let path = require('path')

function compileHtml() {
    let teml = fs.readFileSync(path.resolve(__dirname, '..', 'template', 'list.html'), 'utf8')
    return handlebars.compile(teml)
}

module.exports = compileHtml