require('./server/shared/extend/promises')
require('console-stamp')(console, { pattern: 'yyyy-mm-dd HH:MM:ss' })

const checksum = require('checksum')
const ProgressBar = require('progress')
const ReadlineSync = require('readline-sync')
const notifier = require('node-notifier')

const Connector = require('./bg/lib/connector')
const Metadata = require('./bg/lib/metadata')
const getopts = require('getopts')

const options = getopts(process.argv.slice(2), {
    alias: {
        c: 'config'
    }
})

const config = require(`./${options.config || 'config.json'}`)

const connector = new Connector(config, null)
const queue = connector.queue(false)
let bar, checksums

const APP_NAME = 'elastic library'

connector.on('end', () => {
    bar.terminate()
    console.info('-- finished')
    notifier.notify({
        title: 'Finished import',
        message: APP_NAME,
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
            title: `Progress (${bar.curr} / ${bar.total}) ${percent}%`,
            message: APP_NAME
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
                    .catch(e => {
                        console.error(`-- error [${bar.curr}/${bar.total}]`, e)
                        bar.interrupt('')

                        ReadlineSync.question('Continue...')
                        cb()
                    })
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
                title: 'Starting import',
                message: APP_NAME
            })
        })
})

connector.init()
