const sharp = require('sharp')
const Vibrant = require('node-vibrant')
const Parser = require('./base/parser')

class ImageParser extends Parser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return Promise.all([
            this.getMetadata(metadata.getFilePath(), metadata),
            this.getPalette(metadata.getFilePath(), metadata),
            this.getThumbnail(metadata.getFilePath(), metadata)
        ]).then(v => {
            metadata.set('image', {
                ...v[0],
                ...v[1],
                ...v[2]
            })
            return metadata
        })
    }

    getMetadata(path) {
        return new Promise((resolve, reject) => {
            sharp(path)
                .metadata()
                .then(($0) => {
                    if ($0.exif) { delete $0.exif }
                    if ($0.icc) { delete $0.icc }
                    if ($0.iptc) { delete $0.iptc }
                    if ($0.xmp) { delete $0.xmp }

                    resolve($0)
                }).catch(e => reject(e))
        })
    }

    getThumbnail(path) {
        return new Promise((resolve, reject) => {
            sharp(path)
                .resize(300, 300)
                .min()
                .jpeg({
                    quality: 60,
                    progressive: true
                })
                .toBuffer()
                .then(buffer => {
                    resolve({ thumbnail: buffer.toString('base64') })
                }).catch(() => {
                    // no failure to index if the thumb can't be generated
                    resolve()
                })
        })
    }

    getPalette(path) {
        return new Promise((resolve, reject) => {
            Vibrant.from(path)
                .getPalette()
                .then(palette => {
                    const out = {}
                    for (const swatch in palette) {
                        if (palette.hasOwnProperty(swatch) && palette[swatch]) {
                            out[swatch] = palette[swatch].getHex()
                        }
                    }

                    resolve({ palette: out })
                }).catch(() => {
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
                    },
                    palette: {
                        type: 'object',
                        properties: {
                            Vibrant: { type: 'text' },
                            LightVibrant: { type: 'text' },
                            DarkVibrant: { type: 'text' },
                            Muted: { type: 'text' },
                            LightMuted: { type: 'text' },
                            DarkMuted: { type: 'text' }
                        }
                    },
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
