const fs = require('fs');
const url = require('url');
const sharp = require('sharp');

class ImageHandler {

    constructor() {

    }

    handle(request) {
        return new Promise((resolve, reject) => {
            // // Strip protocol
            let uri = url.parse(decodeURI(request.url.substr(ImageHandler.PROTOCOL.length + 2)), true);
            let ext = uri.pathname.substr(uri.pathname.lastIndexOf('.')+1);

            // console.info('-- url:', url.parse(uri));

            fs.readFile(uri.pathname, (err, data) => {
                if(err) {
                    reject(err)
                } else {
                    if(uri.query && uri.query.w) {
                        let width = parseInt(uri.query.w, 10)
                        sharp(data)
                            .resize(width, width)
                            .min()
                            .toBuffer()
                            .then(buffer => {
                                resolve({ mimeType: 'image/' + ext, data: buffer })
                            })
                    } else {
                        resolve({ mimeType: 'image/' + ext, data });
                    }
                }
            });
        })
    }

    config(protocol) {
        protocol.registerStandardSchemes([ImageHandler.PROTOCOL])
    }

    register(protocol) {
        // how to load local files! :D
        protocol.registerBufferProtocol(ImageHandler.PROTOCOL, (request, callback) => {
            this.handle(request).then(callback);
        });
    }
}
ImageHandler.PROTOCOL = 'image'

module.exports = ImageHandler