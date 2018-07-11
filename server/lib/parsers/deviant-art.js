const _ = require('lodash')

class DeviantArtParser {
    /**
     * @param {Metadata} metadata
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve) => {
            if (metadata.has('keywords')) {
                if (metadata.get('keywords').indexOf('DeviantArt') > -1 || metadata.get('file.name').indexOf('_by_') > -1) {
                    // parse filename

                    let filename = metadata.get('file.name')
                    if (filename.indexOf('_by_') > -1) {
                        let [title, author] = filename.split('_by_')
                        author = author.split('-').shift()

                        metadata.set('author', _.capitalize(author))
                        metadata.set('title', _.capitalize(title.replace(/_/g, ' ')))
                        metadata.add('keywords', [author])
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

module.exports = DeviantArtParser
