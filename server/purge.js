require('./shared/extend/promises')

const config = require('../config.json')
const queue = require('queue')
const fs = require('fs')
const ProgressBar = require('progress')

const Watcher = require('./lib/watcher')
const Metadata = require('./lib/metadata')
const Indexer = require('./lib/indexer')

const indexer = new Indexer(config)

const files = {}
const watchers = []

for (let parser in config.parsers) {
    let P = require('./lib/parsers/' + parser)
    let c = config.parsers[parser]
    let prsr = new P(c)

    Metadata.addParser(prsr)
    indexer.addMapping(prsr.mapping)
}

function purgeDocuments() {
    console.info('-- purge:found', Object.keys(files).length)

    indexer.client.scroll({
        size: 1000,
        sort: ['_doc']
    })
        .then(documents => {
            console.info('-- purge:online', documents.length)

            let map = documents.map(doc => {
                return { id: doc._id, checksum: doc._source.checksum }
            })

            let hasSeen = []
            let filtered = map.filter(x => {
                if (hasSeen.indexOf(x.checksum) === -1) {
                    hasSeen.push(x.checksum)
                    return Object.keys(files).indexOf(x.checksum) === -1
                }
                return true
            })

            console.info('-- purge:map', map.length, filtered.length)

            const q = queue({
                autostart: false,
                concurrency: 5
            })

            filtered.map(doc => {
                q.push((cb) => {
                    indexer.client.delete(doc.id)
                        .then(result => {
                        // console.info('-- purge:delete', doc.id, result);
                            cb()
                        })
                        .catch(() => {
                            cb()
                        })
                })
            })

            let bar = new ProgressBar('-- purging [:bar] :percent :etas', {
                complete: '=',
                incomplete: ' ',
                width: 50,
                total: q.length
            })

            q.on('success', () => { bar.tick() })
            q.on('end', () => {
                console.info('-- purge:finished')
                process.exit(0)
            })

            if (q.length > 0) {
                q.start()
            } else {
                console.info('-- purge:finished')
                process.exit(0)
            }
        }).catch(error => {
            console.error('-- purge:scroll', error)
        })
}

indexer.init().on('ready', () => {
    const q = queue({
        autostart: true,
        concurrency: 5
    })

    q.on('end', () => { purgeDocuments() })

    function handleFileEvent(data) {
        q.push((cb) => {
            let m = new Metadata(data.dir, data.filename)

            m.read()
                .then((metadata) => {
                    let checksum = metadata.get('checksum')
                    files[checksum] = data.filename

                    cb()
                })
                .catch(() => cb())
        })
    }

    for (const dir of config.media.directories) {
        if (fs.existsSync(dir)) {
            watchers.push(new Watcher(dir))
        }
    }

    watchers.forEach((w) => {
        w.on('watcher:rename', handleFileEvent)
        w.on('watcher:change', handleFileEvent)
        w.on('watcher:read', handleFileEvent)
        w.on('watcher:finished', () => {
            let bar = new ProgressBar('-- indexing [:bar] :percent :etas', {
                complete: '=',
                incomplete: ' ',
                width: 50,
                total: q.length
            })

            q.on('success', () => { bar.tick() })

            if (q.length > 0) {
                q.start()
            }
        })

        w.watch().read()
    })
})