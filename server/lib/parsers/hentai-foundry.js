const _ = require('lodash')

class HentaiFoundryParser {
    /**
     * @param {Metadata} metadata
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve) => {
            if (metadata.has('keywords')) {
                if (/([a-zA-Z0-9_]+)-([0-9]+)-([a-zA-Z0-9_]+)/.test(metadata.get('file.name'))) {
                    // parse filename

                    let filename = metadata.get('file.name')
                    if (filename.indexOf('-') > -1) {
                        let filename = metadata.get('file.name')
                        let [author, code, ...title] = filename.split('-')

                        author = _.capitalize(author)

                        if (Array.isArray(title)) {
                            title = title.join('-')
                        }

                        metadata.set('author', author)
                        metadata.set('title', _.capitalize(title.replace(/_/g, ' ')))
                        metadata.add('keywords', [code, author])
                    }
                }
            }

            resolve()
        })
    }

    get mapping() {
        return {
            author: {
                type: 'keyword'
            },
            title: {
                type: 'keyword'
            },
            keywords: {
                type: 'keyword',
                eager_global_ordinals: true
            }
        }
    }
}

module.exports = HentaiFoundryParser
