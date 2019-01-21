const { EventEmitter } = require('events')
const checksum = require('checksum')

const Metadata = require('../lib/metadata')
const Connector = require('../lib/connector')

require('../../server/shared/extend/promises')

module.exports = class Import extends EventEmitter {
    constructor(config) {
        super()

        this.config = config
        this.indexer = new Connector(config, null)
        this.queue = this.indexer.queue(false)

        this.checksums = {}
        this.indexer.on('ready', () => {
            this.indexer.checksums()
                .then(sums => {
                    this.checksums = sums
                    this.queue.start()
                })
        })
    }

    start() {
        this.indexer.on('file', file => {
            this.file(file)
        })
        this.indexer.on('end', () => {
            this.emit('done')
        })
        this.indexer.init()

        this.emit('started')
    }

    file({ dir, filename }) {
        this.queue.push(cb => {
            checksum.file(`${dir}/${filename}`, { algorithm: 'md5' }, (err, sum) => {
                if (err) {
                    return cb()
                } else if (!(sum in this.checksums)) {
                    const metadata = new Metadata(dir, filename)

                    metadata
                        .read()
                        .then(() => metadata.extendData())
                        .then(() => {
                            this.metadata(metadata)
                                .finally(cb)
                        }).catch(() => {
                            this.metadata(metadata)
                                .finally(cb)
                        })
                } else {
                    return cb()
                }
            })
        })
    }

    metadata(metadata) {
        this.emit('new.import', metadata)

        return this.indexer.index(metadata)
    }
}
