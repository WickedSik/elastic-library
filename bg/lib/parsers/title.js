const Parser = require('./base/parser')

/**
 * @class TitleParser
 * @implements Parser
 */
class TitleParser extends Parser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {
            let title = null
            if (!metadata.has('title')) {
                title = metadata.get('file.name')
            } else {
                title = metadata.get('title')
            }

            metadata.set('title', title
                .replace(/[\s_\-.]+/g, ' ')
                .replace(/(jpe?g|png|gif)/g, '')
                .replace(/[\s]{2,}/g, ' ')
            )

            resolve()
        })
    }

    get mapping() {
        return {
            title: {
                type: 'keyword',
                store: true
            }
        }
    }

    accepts(file) {
        return true
    }
}

module.exports = TitleParser
