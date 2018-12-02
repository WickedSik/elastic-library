require('./server/shared/extend/promises')
require('console-stamp')(console, { pattern: 'yyyy-mm-dd HH:MM:ss' })

const checksum = require('checksum')
const ProgressBar = require('progress')
const ReadlineSync = require('readline-sync')
const notifier = require('node-notifier')

const Connector = require('./server/connector')
const Metadata = require('./server/lib/metadata')
const config = require('./config.json')

const connector = new Connector(config, null)
const queue = connector.queue(false)
let bar, checksums

connector.on('end', () => {
    bar.terminate()
    console.info('-- finished')
    notifier.notify({
        title: 'elastic library',
        message: 'Finished import',
        wait: true
    })
    process.exit(0)
})

connector.on('success', () => {
    bar.tick()

    if (bar.curr % Math.floor(bar.total / 10) === 0) {
        const ratio = bar.curr / bar.total
        const percent = Math.floor(ratio * 100)

        notifier.notify({
            title: 'elastic library',
            message: `Progress (${bar.curr} / ${bar.total}) ${percent}%`
        })
    }
})
connector.on('file', (f) => {
    queue.push(cb => {
        checksum.file(`${f.dir}/${f.filename}`, { algorithm: 'md5' }, (err, sum) => {
            if (err) {
                console.error(`-- error [${bar.curr}/${bar.total}]`, err)
                bar.interrupt('')

                ReadlineSync.question('Continue...')
                cb()
            } else if (!(sum in checksums)) {
                let metadata = new Metadata(f.dir, f.filename)
                metadata
                    .read()
                    .then(() => metadata.extendData())
                    .then(() => {
                        connector
                            .index(metadata)
                            .finally(cb)
                    })
                cb()
            } else {
                cb()
            }
        })
    })
})

connector.on('ready', () => {
    bar = new ProgressBar('                               -- indexing [:bar] :percent :etas (:rate/s)', {
        complete: '=',
        incomplete: ' ',
        width: 120,
        total: queue.length
    })

    console.info('-- reading existing media')
    connector.checksums()
        .then(sums => {
            checksums = sums
            queue.start()

            notifier.notify({
                title: 'elastic library',
                message: 'Starting import'
            })
        })
})

connector.init()
