const fs = require('fs')
const url = require('url')

class VideoHandler {
    config(protocol) {
        protocol.registerStandardSchemes([VideoHandler.PROTOCOL])
    }

    createStream(path, req, ext) {
        const stat = fs.statSync(path)
        const fileSize = stat.size
        const range = req.headers.range

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] 
                ? parseInt(parts[1], 10)
                : fileSize-1
            const chunksize = (end-start)+1
            const file = fs.createReadStream(path, {start, end})
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/' + ext,
            }

            return {
                statusCode: 206,
                headers: head,
                data: file
            }
        } else {
            return {
                statusCode: 200,
                headers: {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/' + ext,
                },
                data: fs.createReadStream(path)
            }
        }
    }

    register(protocol) {
        // how to load local files! :D
        protocol.registerStreamProtocol(VideoHandler.PROTOCOL, (request, callback) => {
            let uri = url.parse(decodeURI(request.url.substr(VideoHandler.PROTOCOL.length + 2)), true)
            let ext = uri.pathname.substr(uri.pathname.lastIndexOf('.') + 1)

            const data = this.createStream(decodeURI(uri.pathname), request, ext)

            callback(data)
        })
    }
}
VideoHandler.PROTOCOL = 'video'

module.exports = VideoHandler
