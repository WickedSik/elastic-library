const Booru = require('booru')
const url = require('url')

class BooruHandler {
    constructor() {
        this.booru = new Booru()
    }

    handle(request) {
        // Strip protocol
        let uri = url.parse(decodeURI(request.url.substr(BooruHandler.PROTOCOL.length + 2)), true)
        
        return this.booru.show('e621', uri.pathname.replace(/\//g, ''))
    }

    config(protocol) {
        protocol.registerStandardSchemes([BooruHandler.PROTOCOL])
    }

    register(protocol) {
        // how to load local files! :D
        protocol.registerStringProtocol(BooruHandler.PROTOCOL, (request, callback) => {
            this.handle(request).then(result => callback({
                data: JSON.stringify(result),
                mimeType: 'application/json',
                charset: 'utf-8'
            }))
        })
    }
}
BooruHandler.PROTOCOL = 'booru'

module.exports = BooruHandler
