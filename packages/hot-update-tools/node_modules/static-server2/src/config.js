let path = require('path')

let config = {
    host: 'localhost',
    port: '8080',
    document: path.resolve(__dirname, '..', 'public')
}

module.exports = config