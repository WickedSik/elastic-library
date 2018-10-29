const elastic = require('elasticsearch')
const events = require('events')
const _ = require('lodash')

class Client extends events.EventEmitter {
    constructor(config) {
        super()

        this._index = config.index
        this._mapping = [
            { // always used
                favorite: {
                    type: 'boolean'
                }
            }
        ]
        this._client = new elastic.Client(config.search)
    }

    ping(opt) {
        return this._client.ping(opt)
    }

    get indices() {
        return this._client.indices
    }

    index(opt) {
        return this._client.index(opt)
    }

    update(opt) {
        return this._client.update(opt)
    }

    delete(id) {
        return this._client.delete({
            index: this._index,
            type: 'media',
            id
        })
    }

    search(opt) {
        return this._client.search(opt)
    }

    scroll(opt) {
        let documents = []
        const client = this._client

        return new Promise((resolve, reject) => {
            client.search({
                index: this._index,
                type: 'media',
                scroll: '30s',
                size: 250,
                ...opt
            }, function untildone(error, response) {
                if (error) {
                    reject(error)
                }

                documents = _.concat(documents, response.hits.hits)

                if (response.hits.total > documents.length) {
                    client.scroll({
                        scrollId: response._scroll_id,
                        scroll: '30s'
                    }, untildone)
                } else {
                    resolve(documents)
                }
            })
        })
    }
}

module.exports = Client
