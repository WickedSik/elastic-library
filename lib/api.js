const Booru = require('es6-booru')
const FurAffinity = require('furaffinity')
const url = require('url')

class ApiHandler {
    constructor() {
        this.booru = new Booru()
    }

    handle(request) {
        // Strip protocol
        let uri = url.parse(decodeURI(request.url.substr(ApiHandler.PROTOCOL.length + 2)), true)
        let [site, path] = ApiHandler.trim(uri.pathname, '\/').split('/')

        switch(site) {
        // furaffinity needs a "read this one post" call, which is currently missing
        case 'furaffinity': return null
        default:
            return this.booru.show(site, path)
        }
    }

    config(protocol) {
        protocol.registerStandardSchemes([ApiHandler.PROTOCOL])
    }

    register(protocol) {
        // how to load local files! :D
        protocol.registerStringProtocol(ApiHandler.PROTOCOL, (request, callback) => {
            this.handle(request).then(result => callback({
                data: JSON.stringify(result),
                mimeType: 'application/json',
                charset: 'utf-8'
            }))
        })
    }
}
ApiHandler.PROTOCOL = 'api'

ApiHandler.trim = function(x, characters) {
    characters = characters || '\s'
    return x.replace(new RegExp('^' + characters + '+|' + characters + '+$','gm'), '');
}

module.exports = ApiHandler
