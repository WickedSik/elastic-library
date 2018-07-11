const events = require('events')
const _ = require('lodash')
const Client = require('../shared/client')

class Indexer extends events.EventEmitter {
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
        this._client = new Client(config)
    }

    init() {
        this._client.ping({
            // ping usually has a 3000ms timeout
            requestTimeout: 1000
        }).then(() => {
            console.info('-- cluster is alive')
            this.createIndex()
        }).catch((e) => {
            console.warn('-- cluster is down!', e)
            process.exit(-1)
        })

        return this
    }

    createIndex() {
        this._client.indices.create({
            index: this._index,
            body: {
                settings: {
                    number_of_shards: 2
                },
                mappings: this.mapping
            }
        }).then(() => {
            console.info('-- index created')
        }).catch(() => {
            console.warn('-- index already exists')
        }).finally(() => {
            console.info('-- initiation')

            this.emit('ready')
        })
    }

    /**
     *
     * @param Metadata metadata
     * @returns {Promise}
     */
    index(metadata) {
        return new Promise((resolve, reject) => {
            this._client.index({
                index: this._index,
                type: 'media',
                body: metadata.search
            }).then(() => {
                // console.info('-- indexed', metadata.get('file.name'));
                resolve(metadata)
            }).catch((e) => {
                console.error('-- not indexed', metadata.search, e)

                reject(e)
                process.exit(-1)
            })
        })
    }

    /**
     *
     * @param Metadata metadata
     * @returns {Promise}
     */
    update(metadata, id) {
        return new Promise((resolve, reject) => {
            this._client.index({
                index: this._index,
                type: 'media',
                id: id,
                body: metadata.search
            }).then(() => {
                // console.info('-- updated', metadata.get('file.name'), id);
                resolve(metadata)
            }).catch((e) => {
                // console.error('-- not updated', id, metadata.search);
                reject(e)
            })
        })
    }

    /**
     *
     * @param   Metadata metadata
     * @returns {Promise}
     */
    exists(metadata) {
        return new Promise((resolve, reject) => {
            this._client.search({
                index: this._index,
                type: 'media',
                body: {
                    query: {
                        term: {
                            checksum: metadata.get('checksum')
                        }
                    },
                    size: 1
                }
            }).then((result) => {
                if (result.hits.total > 0) {
                    resolve({
                        id: result.hits.hits[0]._id,
                        data: result.hits.hits[0]._source
                    })
                } else {
                    reject(new Error('No Hits'))
                }
            }).catch((e) => {
                reject(e)
            })
        })
    }

    search(query) {
        return new Promise((resolve, reject) => {
            this._client.search({
                index: this._index,
                type: 'media',
                body: query
            }).then(data => {
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    addMapping(mapping) {
        this._mapping.push(mapping)
    }

    get mapping() {
        const properties = {}

        this._mapping.forEach((m) => {
            Object.keys(m).forEach((key) => {
                if (properties[key]) {
                    properties[key] = _.extend(properties[key], m[key])
                } else {
                    properties[key] = m[key]
                }
            })
        })

        return {
            media: {
                properties
            }
        }
    }

    get client() {
        return this._client
    }
}

module.exports = Indexer
