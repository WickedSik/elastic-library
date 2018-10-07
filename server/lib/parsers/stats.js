const fs = require('fs')
const Parser = require('./base/parser')

/**
 * @class StatsParser
 */
class StatsParser extends Parser {
    /**
     * @param {Metadata} metadata
     * @memberof StatsParser
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {
            fs.stat(metadata.getFilePath(), (err, stats) => {
                if (err) {
                    reject(err)
                }

                metadata.set('file.created_at', stats.birthtime)
                metadata.set('file.updated_at', stats.mtime)
                metadata.set('file.size', stats.size)

                resolve()
            })
        })
    }

    get mapping() {
        return {
            file: {
                type: 'object',
                properties: {
                    created_at: {
                        type: 'date'
                    },
                    updated_at: {
                        type: 'date'
                    },
                    size: {
                        type: 'integer'
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

module.exports = StatsParser
