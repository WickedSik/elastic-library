require('../shared/extend/promises')

const queue = require('queue')
const fs = require('fs')
const ProgressBar = require('progress')
const moment = require('moment')

const Watcher = require('../lib/watcher')
const Metadata = require('../lib/metadata')
const Indexer = require('../lib/indexer')

const getopts = require('getopts')

const options = getopts(process.argv.slice(2), {
    alias: {
        c: 'config'
    }
})

const config = require(`../../${options.config || 'config.json'}`)

const indexer = new Indexer(config)

const files = {}
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
    backupDocuments()
})

// no need to run all parsers
const parsers = ['path', 'checksum']
parsers.forEach(function(parser) {
    let P = require('../lib/parsers/' + parser)
    let c = config.parsers[parser]
    let prsr = new P(c)

    Metadata.addParser(prsr)
    indexer.addMapping(prsr.mapping)
})

function backupDocuments() {
    console.info('-- backup:found', Object.keys(files).length)

    const backup = fs.createWriteStream(`./backups/backup-${moment().format('YYYYMMDDHHmmss')}.json`)

    indexer.client.scroll({
        size: 1000,
        sort: ['_doc']
    })
        .then(documents => {
            console.info('-- backup:online', documents.length)

            let map = documents.map(doc => {
                if (doc._source.image && doc._source.image.thumbnail) {
                    delete doc._source.image.thumbnail
                }
                return { id: doc._id, checksum: doc._source.checksum, body: doc._source }
            })

            backup.write(JSON.stringify(map), error => {
                if (error) throw error

                backup.close()
                console.info('-- backup:finished')
                process.exit(0)
            })
        }).catch(error => {
            console.error('-- backup:scroll', error)
        })
}

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
