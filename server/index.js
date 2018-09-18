require('./shared/extend/promises')

const queue = require('queue')
const fs = require('fs')
const ProgressBar = require('progress')

const Watcher = require('./lib/watcher')
const Metadata = require('./lib/metadata')
const Indexer = require('./lib/indexer')

const getopts = require('getopts')

const options = getopts(process.argv.slice(2), {
    alias: {
        c: 'config'
    }
})

const config = require(`../${options.config || 'config.json'}`)

const watchers = []
const q = queue({
    autostart: true,
    concurrency: 5
})

q.on('error', (error) => {
    console.error('-- queue:error', error)
})
q.on('timeout', () => {
    // console.info('-- queue:timeout');
})
q.on('end', (error) => {
    console.info('-- queue:end', error || '')
    process.exit(0) // we're done :)
})

function handleFileEvent(data) {
    q.push((cb) => {
        let m = new Metadata(data.dir, data.filename)
        m.read()
            .then((metadata) => {
                indexer.exists(metadata)
                    .then((d) => {
                        // console.info('-- checksum %s already exists', metadata.get('checksum'), d.id);
                        metadata.cleanData = d.data

                        // indexer.update(metadata, d.id)
                        // .then(() => {
                        //     console.info('-- updated');
                        // }).catch((e) => {
                        //     console.warn('-- failed to update', e);
                        //     process.exit(-1);
                        // }).finally(() => {
                        cb()
                        // });
                    })
                    .catch(() => {
                        // console.info('-- %s does not exist', metadata.get('checksum'));
                        metadata.extendData().then(() => {
                            indexer.index(metadata)
                                .finally(() => {
                                    cb()
                                })
                        }).catch(() => { // index regardless of extended data
                            indexer.index(metadata)
                                .finally(() => {
                                    cb()
                                })
                        })
                    })
            })
            .catch((e) => {
                // console.error('-- metadata:error', e);
                cb()
            })
    })
}

const indexer = new Indexer(config)

for (let parser in config.parsers) {
    let P = require('./lib/parsers/' + parser)
    let c = config.parsers[parser]
    let prsr = new P(c)

    Metadata.addParser(prsr)
    indexer.addMapping(prsr.mapping)
}

indexer.init().on('ready', () => {
    for (const dir of config.media.directories) {
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

        w.on('watcher:rename', handleFileEvent)
        w.on('watcher:change', handleFileEvent)
        w.on('watcher:read', handleFileEvent)
        w.on('watcher:finished', () => {
            watcherComplete()
        })

        w.watch().read()
    })

    Promise.all(watcherPromise).then(() => {
        let bar = new ProgressBar('-- indexing [:bar] :percent :etas (:rate/s)', {
            complete: '=',
            incomplete: ' ',
            width: 120,
            total: q.length
        })

        q.on('success', () => { bar.tick() })

        if (q.length > 0) {
            q.start()
        }
    })
})
