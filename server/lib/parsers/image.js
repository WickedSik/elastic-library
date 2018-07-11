const sharp = require('sharp')

class ImageParser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {
            sharp(metadata.getFilePath())
                .metadata()
                .then(($0) => {
                    if ($0.exif) { delete $0.exif }
                    if ($0.icc) { delete $0.icc }
                    // @ts-ignore
                    if ($0.iptc) { delete $0.iptc }
                    // @ts-ignore
                    if ($0.xmp) { delete $0.xmp }

                    metadata.set('image', $0)
                    resolve()
                }).catch(e => reject(e))
        })
    }

    get mapping() {
        return {
            image: {
                type: 'object',
                properties: {
                    format: {
                        type: 'keyword'
                    },
                    space: {
                        type: 'keyword'
                    },
                    width: {
                        type: 'integer'
                    },
                    height: {
                        type: 'integer'
                    },
                    density: {
                        type: 'integer'
                    },
                    channels: {
                        type: 'integer'
                    }
                }
            }
        }
    }
}

module.exports = ImageParser
