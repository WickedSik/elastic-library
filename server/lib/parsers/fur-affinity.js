const _ = require('lodash')
const Parser = require('./base/parser')

class FurAffinityParser extends Parser {
    /**
     * @param {Metadata} metadata
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve) => {
            if (metadata.has('keywords')) {
                if (/([0-9]+\.)([a-zA-Z0-9-]+_){1,}([a-zA-Z0-9-]+)/.test(metadata.get('file.name'))) {
                    // parse filename

                    let filename = metadata.get('file.name')
                    let [code, title_author] = filename.split('.')
                    let [author, ...title] = title_author.split('_')

                    author = _.capitalize(author)

                    if (Array.isArray(title)) {
                        title = title.join('_')
                    }

                    metadata.set('author', author)
                    metadata.set('title', _.capitalize(title.replace(/_/g, ' ')))
                    metadata.add('keywords', [code, author])
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

module.exports = FurAffinityParser
