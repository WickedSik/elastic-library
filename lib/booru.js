const Booru = require('../bg/bg_ts/commands/lib/utils/booru').default
const url = require('url')

class BooruHandler {
    constructor() {
        this.booru = new Booru()
    }

    handle(request) {
        // Strip protocol
        let uri = url.parse(decodeURI(request.url.substr(BooruHandler.PROTOCOL.length + 2)), true)
        let [site, path] = BooruHandler.trim(uri.pathname, '\/').split('/')
        
        try {
            return this.booru.search(site, [`md5:${path}`], { limit: 1 })
        } catch (error) {
            console.error('-- booru', error.message, error.stack)
        }
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

BooruHandler.trim = function(x, characters) {
    characters = characters || '\s'
    return x.replace(new RegExp('^' + characters + '+|' + characters + '+$','gm'), '');
}

module.exports = BooruHandler
