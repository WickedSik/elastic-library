const fs = require('fs')
const path = require('path')
const EventEmitter = require('events').EventEmitter

const recursive = require('recursive-readdir')

class Watcher extends EventEmitter {
    constructor(dir) {
        super()

        this.dir = dir
        this.watching = false
    }

    watch() {
        this.watcher = fs.watch(this.dir, {
            persistent: true,
            recursive: true
        }, (eventType, filename) => {
            /*
             * watcher:(rename|change)
             *      {
             *          dir: '/Volumes/SMALLCAKES/Personal/Images',
             *          filename: 'WH/wallhaven-525017.jpg'
             *      }
             */
            this.emit('watcher:' + eventType, {
                dir: this.dir,
                filename
            })
        })

        this.watching = true

        return this
    }

    read() {
        // reads all files in the dir and throws an event for it (watcher:read)
        recursive(this.dir, (err, files) => {
            if (err) {
                console.trace('error', err)
                return
            }

            for (const f of files) {
                if (path.basename(f).substr(0, 1) === '.') {
                    continue
                }

                let filename = f.replace(this.dir, '').substr(1)

                this.emit('watcher:read', {
                    dir: this.dir,
                    filename
                })
            }

            console.info('-- watcher:read', 'finished')
            this.emit('watcher:finished')
        })

        return this
    }

    stop() {
        if (this.watcher) {
            this.watcher.close()
            this.watching = false
        }

        return this
    }
}

module.exports = Watcher
