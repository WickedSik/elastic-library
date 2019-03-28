const fs = require('fs')
const url = require('url')
const path = require('path')
// const os = require('os')

class ImageHandler {
    constructor() {
        // sharp needs to be separated from electron
        this.file = true // os.platform() === 'win32'
    }

    handleSharp(request) {
        const sharp = require('sharp')

        return new Promise((resolve, reject) => {
            // Strip protocol
            let uri = url.parse(decodeURI(request.url.substr(ImageHandler.PROTOCOL.length + 2)), true)
            let ext = uri.pathname.substr(uri.pathname.lastIndexOf('.') + 1)

            fs.readFile(decodeURI(uri.pathname), (err, data) => {
                if (err) {
                    reject({ mimeType: 'text/html', data: Buffer.from(`<h4>500 ${err}</h4>`) })
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
                        resolve({ mimeType: 'image/' + ext, data: Buffer.from(data) })
                    }
                }
            })
        })
    }
    
    handleFile(request) {
        return new Promise((resolve, reject) => {
            // Strip protocol
            const uri = '/' + decodeURI(request.url.substr(ImageHandler.PROTOCOL.length + 3)).replace(/--/g, ':').replace(/[\/\\]/g, path.sep)
            const ext = uri.substr(uri.lastIndexOf('.') + 1)

            fs.exists(uri, (exists) => {
                if (ext === 'webm' || !exists) {
                    reject(undefined)
                    return
                }

                resolve({ path: uri })
            })
        })
    }

    register(protocol) {
        // how to load local files! :D
        if(this.file) {
            protocol.registerFileProtocol(ImageHandler.PROTOCOL, (request, callback) => {
                console.info('-- images:file', request.url)

                this.handleFile(request)
                .then(callback)
                .catch(callback)
            })
        } else {
            protocol.registerBufferProtocol(ImageHandler.PROTOCOL, (request, callback) => {
                console.info('-- images:sharp', request.url)

                this.handleSharp(request)
                .then(callback)
                .catch(callback)
            })
        }
    }
}
ImageHandler.PROTOCOL = 'image'

module.exports = ImageHandler
