const Parser = require('./base/parser')
const thumb = require('thumbsupply')
const fs = require('fs-extra')

class VideoThumbParser extends Parser {
    parse(metadata) {
        return new Promise((resolve, reject) => {
            thumb.generateThumbnail(metadata.getFilePath(), {
                timestamp: '10%',
                forceCreate: true
            }).then(thumbnail => {
                fs.readFile(thumbnail).then(buffer => {
                    metadata.set('image', {
                        thumbnail: buffer.toString('base64')
                    })
                    resolve(metadata)
                }).catch(e => {
                    console.error('-- failed to create video thumbnail (readfile)', e)
                    resolve()
                })
            }).catch(e => {
                // console.error('-- failed to create video thumbnail (generate)', e)
                resolve()
            })
        })
    }

    get mapping() {
        return {
            image: {
                type: 'object',
                properties: {
                    thumbnail: {
                        type: 'binary',
                        doc_values: false
                    }
                }
            }
        }
    }

    accepts(file) {
        return /(.+)\.(webm|mp4|mpg)/.test(file)
    }
}

module.exports = VideoThumbParser
