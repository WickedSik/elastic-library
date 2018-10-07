require('../shared/extend/promises')

const queue = require('queue')
const ProgressBar = require('progress')
const Indexer = require('../lib/indexer')

const getopts = require('getopts')

const options = getopts(process.argv.slice(2), {
    alias: {
        c: 'config',
        f: 'file'
    }
})

const config = require(`../../${options.config || 'config.json'}`)
const indexer = new Indexer(config)

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
    process.exit(0)
})

try {
    const backup = require(options.file)
    const client = indexer._client

    backup.map(doc => {
        q.push(cb => {
            const { id, body } = doc

            /*
            this._client.index({
                index: this._index,
                type: 'media',
                body: metadata.search
            })
            */
            client.index({
                index: indexer._index,
                type: 'media',
                id,
                body
            })
                .then(() => {
                    cb()
                })
                .catch(reason => {
                    console.error('-- restore:failed', id, reason)
                    cb()
                })
        })
    })

    let bar = new ProgressBar('-- restoring [:bar] :percent :etas (:rate/s)', {
        complete: '=',
        incomplete: ' ',
        width: 120,
        total: q.length
    })

    q.on('success', () => { bar.tick() })

    if (q.length > 0) {
        q.start()
    }
} catch (error) {
    console.error('-- restore:loading', error)
    process.exit(127)
}
