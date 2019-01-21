const Parser = require('./base/parser')

class NumberParser extends Parser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve) => {
            let matches = metadata.file.match(/[0-9]{4,}/g)

            if (matches) {
                matches = matches.map((x) => {
                    return `${x}`
                })
            } else {
                matches = []
            }

            metadata.set('numbers', matches)

            resolve()
        })
    }

    get mapping() {
        return {
            numbers: {
                type: 'keyword'
            }
        }
    }

    accepts(file) {
        return true
    }
}

module.exports = NumberParser
