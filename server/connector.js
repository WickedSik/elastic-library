require('./shared/extend/promises')

const EventEmitter = require('events').EventEmitter
const queue = require('queue')
const fs = require('fs')

const Watcher = require('./lib/watcher')
const Metadata = require('./lib/metadata')
const Indexer = require('./lib/indexer')

class Connector extends EventEmitter {
    constructor(config, rpc) {
        super()

        this.__config = config
        this.__indexer = new Indexer(this.__config)
        this.__rpc = rpc
        this.connected = false

        for (let parser in this.__config.parsers) {
            let P = require('./lib/parsers/' + parser)
            let c = this.__config.parsers[parser]
            let prsr = new P(c)

            Metadata.addParser(prsr)
            this.__indexer.addMapping(prsr.mapping)
        }

        this._handleFileEvent = this._handleFileEvent.bind(this)
    }

    init() {
        const watchers = []

        this.__indexer.init().on('ready', () => {
            for (const dir of this.__config.media.directories) {
                if (fs.existsSync(dir)) {
                    watchers.push(new Watcher(dir))
                }
            }

            const watcherPromise = []

            watchers.forEach((w) => {
                let watcherComplete

                watcherPromise.push(new Promise((resolve, reject) => {
                    watcherComplete = resolve
                }))

                w.on('watcher:rename', this._handleFileEvent)
                w.on('watcher:change', this._handleFileEvent)
                w.on('watcher:read', this._handleFileEvent)
                w.on('watcher:finished', () => {
                    watcherComplete()
                })

                w.watch().read()
            })

            Promise.all(watcherPromise).then(() => {
                this.connected = true
                this.emit('ready')
            })
        })
    }

    checksums() {
        return this.__indexer.scroll({
            _source: {
                includes: ['checksum']
            },
            sort: '_doc'
        }).then(docs => {
            return docs
                .map(doc => ({ id: doc._id, checksum: doc._source.checksum }))
                .reduce((prev, current) => ({
                    ...prev,
                    [current.checksum]: current.id
                }))
        })
    }

    queue(autostart = true) {
        const q = queue({
            autostart,
            concurrency: 5
        })

        q.on('error', (error) => {
            this.emit('error', error)
        })
        q.on('timeout', (next) => {
            // console.info('-- queue:timeout');
            next()
        })
        q.on('end', (error) => {
            this.emit('end', error)
        })
        q.on('success', (result, job, index) => {
            // console.info('-- q:success', { index, result })
            this.__rpc && this.__rpc.send('imported', result)

            this.emit('success', result)
        })

        return q
    }

    index(data) {
        return this.__indexer.index(data)
    }

    update(data) {
        return this.__indexer.update(data)
    }

    _handleFileEvent(data) {
        this.emit('file', data)
    }
}

module.exports = Connector
