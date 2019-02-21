import { Task } from '../process'
import Elastic from './lib/elastic'
import Storage, { StoredFile } from './lib/storage'
import checksum from 'checksum'
import chalk from 'chalk'
import { sprintf } from 'sprintf-js'
import Parser from './lib/parser'
import ProgressBar from 'progress'
import Cacher from './lib/cacher'

interface Checksum {
    id:string
    checksum:string
}

interface SearchResultHit {
    _id:string
    _source: {
        checksum:string
    }
}

export default class Import implements Task {
    name:string = 'import'
    description:string = 'Imports source directories into Elastic Library'

    client:Elastic
    filesystem:Storage
    progressbar:ProgressBar
    cacher:Cacher

    constructor() {
        this.cacher = new Cacher('checksum')
        this.client = new Elastic()
        this.filesystem = new Storage([
            '/Volumes/BIGCAKES/Images',
            '/Volumes/BIGCAKES/Sets',
            '/Volumes/BIGCAKES/Videos'
        ])
    }

    async run(parameters:any[]) {
        console.info(chalk`-- {magenta [%s]} creating cache directory`, this.timestamp())
        await this.cacher.initCacheDirectory()

        console.info(chalk`-- {magenta [%s]} import starting`, this.timestamp())

        const checksums = await this.checksums()
        console.info(chalk`-- {magenta [%s]} %d checksums`, this.timestamp(), checksums.length)

        const files = await this.files()
        console.info(chalk`-- {magenta [%s]} %d files`, this.timestamp(), files.length)

        this.createProgressbar('calculating checksums', files.length)

        const fileChecksums = await this.fileChecksum(files)
        console.info(chalk`-- {magenta [%s]} %d file checksums`, this.timestamp(), fileChecksums.length)
        await this.cacher.save()

        const simpleChecksums:string[] = checksums.map(sum => sum.checksum)
        const newFiles = fileChecksums.filter(file => simpleChecksums.indexOf(file.checksum) === -1)
        
        const simpleFileChecksums:string[] = fileChecksums.map(sum => sum.checksum)
        const oldDocs = checksums.filter(sum => simpleFileChecksums.indexOf(sum.checksum) === -1)
        console.info(chalk`-- {magenta [%s]} %d new files, %d docs not found as file`, this.timestamp(), newFiles.length, oldDocs.length)

        const duplicateChecksums = this.duplicates(checksums)
        const duplicateFiles = this.duplicates(fileChecksums.map(file => ({ id: `${file.directory}/${file.filename}`, checksum: file.checksum })))
        console.info(chalk`-- {magenta [%s]} %d duplicate checksums, %d duplicate files`, this.timestamp(), duplicateChecksums.length, duplicateFiles.length)

        if(oldDocs.length > 0) {
            this.createProgressbar('removing old docs', oldDocs.length)

            try {
                for(let i = 0; i < oldDocs.length; i++) {
                    await this.client.delete(oldDocs[i].id)
                    this.tick()
                }

                console.info(chalk`-- {magenta [%s]} %d docs removed`, this.timestamp(), oldDocs.length)
            } catch(error) {
                console.error(chalk`-- {magenta [%s]} {red error while removing docs: %s}`, this.timestamp(), error)
            }
        } else {
            console.info(chalk`-- {magenta [%s]} %d docs removed`, this.timestamp(), oldDocs.length)
        }

        if(newFiles.length) {
            this.createProgressbar('indexing files', newFiles.length)

            try {
                for(let i = 0; i < newFiles.length; i++) {
                    await this.index(newFiles[i])
                    this.tick()
                }

                console.info(chalk`-- {magenta [%s]} %d docs inserted`, this.timestamp(), newFiles.length)
            } catch (error) {
                console.error(chalk`-- {magenta [%s]} {red error while indexing: %s}`, this.timestamp(), error)
            }
        } else {
            console.info(chalk`-- {magenta [%s]} %d docs inserted`, this.timestamp(), newFiles.length)
        }

        console.info(chalk`-- {magenta [%s]} import finished`, this.timestamp())
    }

    async checksums():Promise<Checksum[]> {
        return this.client.scroll({
            _source: {
                includes: ['checksum']
            },
            sort: '_doc'
        }).then(documents => {
            return documents.map((doc:SearchResultHit) => {
                return {
                    id: doc._id,
                    checksum: doc._source.checksum
                }
            })
        }).catch(error => {
            throw error
        })
    }

    async files():Promise<StoredFile[]> {
        return this.filesystem.readAll()
    }

    async fileChecksum(files:StoredFile[]):Promise<StoredFile[]> {
        const promises = files.map((file:StoredFile):Promise<StoredFile> => {
            return new Promise((resolve, reject) => {
                if(this.cacher.has(`${file.directory}/${file.filename}`)) {
                    file.checksum = this.cacher.get(`${file.directory}/${file.filename}`)
                    this.tick()
                    return resolve(file)
                }

                checksum.file(`${file.directory}/${file.filename}`, { algorithm: 'md5' }, (err, hash) => {
                    if(err) {
                        return reject(err)
                    }

                    this.cacher.set(`${file.directory}/${file.filename}`, hash)
                    file.checksum = hash
                    this.tick()
                    return resolve(file)
                })
            })
        })

        return Promise.all(promises)
    }

    async index(document:StoredFile):Promise<object> {
        const parser = new Parser()

        try {
            const metadata = await parser.run(document)
            metadata.set('checksum', document.checksum)

            return this.client.index(metadata.getAsTree())
        } catch(e) {
            // no error
        }
    }

    duplicates(checksums:Checksum[]):string[][] {
        const duplicateChecksums = new Map<string, string[]>()
        for(const sum of checksums) {
            if(duplicateChecksums.has(sum.checksum)) {
                const list = duplicateChecksums.get(sum.checksum)
                list.push(sum.id)
                duplicateChecksums.set(sum.checksum, list)
            } else {
                duplicateChecksums.set(sum.checksum, [sum.id])
            }
        }

        const duplicates = Array.from(duplicateChecksums.keys())
            .filter(hash => duplicateChecksums.get(hash).length > 1)
            .map(hash => {
                return duplicateChecksums.get(hash)
            })

        return duplicates
    }

    timestamp():string {
        const now = new Date()

        return sprintf(`%02d:%02d:%02d.%04d`, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
    }

    createProgressbar(label:string, total:number):void {
        if(this.progressbar) {
            // NOTE(jurrien) set completion to 100%
            this.progressbar.update(1)
        }

        this.progressbar = new ProgressBar(chalk`-- {magenta [${this.timestamp()}]} ${label} [:bar] :percent :etas (:rate/s)`, {
            complete: '=',
            incomplete: ' ',
            width: 120,
            total: total,
            callback: () => {
                this.progressbar = null
            }
        })
    }

    tick() {
        if(this.progressbar) {
            this.progressbar.tick()
        }
    }
}