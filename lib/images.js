const fs = require('fs')
const url = require('url')
const sharp = require('sharp')

class ImageHandler {
    constructor() {

    }

    handle(request) {
        return new Promise((resolve, reject) => {
            // // Strip protocol
            let uri = url.parse(decodeURI(request.url.substr(ImageHandler.PROTOCOL.length + 2)), true)
            let ext = uri.pathname.substr(uri.pathname.lastIndexOf('.') + 1)

            fs.readFile(decodeURI(uri.pathname), (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    if (ext === 'webm') {
                        reject({ mimeType: 'text/html', data: Buffer.from('<h4>Not Found</h4>') })
                        return
                    }

                    if (uri.query && uri.query.w) {
                        let width = parseInt(uri.query.w, 10)
                        sharp(data)
                            .resize(width, width)
                            .min()
                            .toBuffer()
                            .then(buffer => {
                                resolve({ mimeType: 'image/' + ext, data: buffer })
                            })
                            .catch(error => {
                                console.error('Failed to load image: %s (%s)', decodeURI(uri.pathname), error)
                                resolve({ mimeType: 'image/' + ext, data })
                            })
                    } else {
                        resolve({ mimeType: 'image/' + ext, data })
                    }
                }
            })
        })
    }

    config(protocol) {
        protocol.registerStandardSchemes([ImageHandler.PROTOCOL])
    }

    register(protocol) {
        // how to load local files! :D
        protocol.registerBufferProtocol(ImageHandler.PROTOCOL, (request, callback) => {
            this.handle(request)
                .then(callback)
                .catch(callback)
        })
    }
}
ImageHandler.PROTOCOL = 'image'

module.exports = ImageHandler
