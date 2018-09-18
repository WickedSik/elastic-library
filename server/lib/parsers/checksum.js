const checksum = require('checksum')
const Parser = require('./base/parser')

/**
 * @class ChecksumParser
 * @implements Parser
 */
class ChecksumParser extends Parser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {
            checksum.file(metadata.getFilePath(), { algorithm: 'md5' }, (err, sum) => {
                if (err) {
                    reject(err)
                }

                metadata.set('checksum', sum)

                resolve()
            })
        })
    }

    get mapping() {
        return {
            checksum: {
                type: 'keyword'
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

module.exports = ChecksumParser
