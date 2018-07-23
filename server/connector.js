require('./shared/extend/promises')

const config = require('../config.json')
const queue = require('queue')
const fs = require('fs')

const Watcher = require('./lib/watcher')
const Metadata = require('./lib/metadata')
const Indexer = require('./lib/indexer')

const watchers = []
const q = queue({
    autostart: true,
    concurrency: 5
})

q.on('error', (error) => {
    console.error('-- queue:error', error)
})
q.on('timeout', (next) => {
    // console.info('-- queue:timeout');
    next()
})

class Connector {
    constructor(rpc) {
        this.__indexer = new Indexer(config)
        this.__rpc = rpc
        this.connected = false

        for (let parser in config.parsers) {
            let P = require('./lib/parsers/' + parser)
            let c = config.parsers[parser]
            let prsr = new P(c)

            Metadata.addParser(prsr)
            this.__indexer.addMapping(prsr.mapping)
        }

        q.on('success', (result, job, index) => {
            console.info('-- q:success', { index, result })
            this.__rpc.send('imported', result)
        })

        this._handleFileEvent = this._handleFileEvent.bind(this)
    }

    init() {
        this.__indexer.init().on('ready', () => {
            this.connected = true

            for (const dir of config.media.directories) {
                if (fs.existsSync(dir)) {
                    watchers.push(new Watcher(dir))
                }
            }

            watchers.forEach((w) => {
                w.on('watcher:rename', this._handleFileEvent)
                w.on('watcher:change', this._handleFileEvent)
                w.on('watcher:read', this._handleFileEvent)
                w.on('watcher:finished', () => {
                    this.__rpc.send('import-total', q.length)

                    if (q.length > 0) {
                        q.start()
                    }
                })

                w.watch().read()
            })
        })
    }

    _handleFileEvent(data) {
        q.push((cb) => {
            let m = new Metadata(data.dir, data.filename)
            m.read()
                .then((metadata) => {
                    this.__indexer.exists(metadata)
                        .then((d) => {
                            // console.info('-- checksum %s already exists', metadata.get('checksum'), d.id)
                            metadata.cleanData = d.data

                            // indexer.update(metadata, d.id)
                            // .then(() => {
                            //     console.info('-- updated');
                            // }).catch((e) => {
                            //     console.warn('-- failed to update', e);
                            //     process.exit(-1);
                            // }).finally(() => {
                            cb(null, m)
                            // });
                        })
                        .catch(() => {
                            // console.info('-- %s does not exist', metadata.get('checksum'))
                            this.__indexer.index(metadata)
                                .finally(() => {
                                    cb(null, m)
                                })
                        })
                })
                .catch((e) => {
                    console.error('-- metadata:error', e)
                    cb()
                })
        })
    }
}

module.exports = Connector
