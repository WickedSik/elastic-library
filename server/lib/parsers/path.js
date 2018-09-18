const path = require('path')
const Parser = require('./base/parser')

class PathParser extends Parser {
    constructor(config) {
        super()

        this.config = config
    }

    /**
     * @param {Metadata} metadata
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve) => {
            let pathdata = path.parse(metadata.getFilePath())

            let dirs = pathdata.dir.split(path.sep).filter((i) => {
                return this.config.ignore.indexOf(i) === -1 && i !== ''
            })

            metadata.set('file.name', pathdata.name)
            metadata.set('file.extension', pathdata.ext)
            metadata.set('file.filename', pathdata.name + pathdata.ext)
            metadata.set('file.path', metadata.getFilePath())

            metadata.add('keywords', dirs)

            resolve()
        })
    }

    get mapping() {
        return {
            file: {
                type: 'object',
                properties: {
                    name: {
                        type: 'keyword'
                    },
                    extension: {
                        type: 'keyword',
                        eager_global_ordinals: true
                    },
                    filename: {
                        type: 'text'
                    },
                    path: {
                        type: 'text'
                    }
                }
            }
        }
    }

    accepts(file) {
        return true
    }

    get runsForExistingItems() {
        return true
    }
}

module.exports = PathParser
