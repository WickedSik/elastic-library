import chalk from 'chalk'
import checksum from 'checksum'

import { Task } from '../process'
import Elastic from './lib/elastic'
import Storage from './lib/storage'
import Parser from './lib/parser'
import Cacher from './lib/cacher'
import { Checksum, StoredFile } from './declarations/files'
import { SearchResultHit } from './declarations/search'
import { timestamp } from './lib/utils/visualize'
import { Progressbar } from './lib/utils/progressbar'

export default class Import implements Task {
    name:string = 'import'
    description:string = 'Imports source directories into Elastic Library'

    client:Elastic
    filesystem:Storage
    cacher:Cacher
    progressbar:Progressbar

    constructor() {
        this.cacher = new Cacher('checksum')
        this.client = new Elastic()
        this.progressbar = new Progressbar()
        this.filesystem = new Storage([
            '/Volumes/BIGCAKES/Images',
            '/Volumes/BIGCAKES/Sets',
            '/Volumes/BIGCAKES/Videos'
        ])
    }

    async run(parameters:any[]) {
        console.info(chalk`-- {magenta [%s]} creating cache directory`, timestamp())
        await this.cacher.initCacheDirectory()

        console.info(chalk`-- {magenta [%s]} import starting`, timestamp())

        const checksums = await this.checksums()
        console.info(chalk`-- {magenta [%s]} %d checksums`, timestamp(), checksums.length)

        const files = await this.files()
        console.info(chalk`-- {magenta [%s]} %d files`, timestamp(), files.length)

        this.progressbar.createProgressbar('calculating checksums', files.length)

        const fileChecksums = await this.fileChecksum(files)
        console.info(chalk`-- {magenta [%s]} %d file checksums`, timestamp(), fileChecksums.length)
        await this.cacher.save()

        const simpleChecksums:string[] = checksums.map(sum => sum.checksum)
        const newFiles = fileChecksums.filter(file => simpleChecksums.indexOf(file.checksum) === -1)
        
        const simpleFileChecksums:string[] = fileChecksums.map(sum => sum.checksum)
        const oldDocs = checksums.filter(sum => simpleFileChecksums.indexOf(sum.checksum) === -1)
        console.info(chalk`-- {magenta [%s]} %d new files, %d docs not found as file`, timestamp(), newFiles.length, oldDocs.length)

        const duplicateChecksums = this.duplicates(checksums)
        const duplicateFiles = this.duplicates(fileChecksums.map(file => ({ id: `${file.directory}/${file.filename}`, checksum: file.checksum })))
        console.info(chalk`-- {magenta [%s]} %d duplicate checksums, %d duplicate files`, timestamp(), duplicateChecksums.length, duplicateFiles.length)

        if(oldDocs.length > 0) {
            this.progressbar.createProgressbar('removing old docs', oldDocs.length)

            try {
                for(let i = 0; i < oldDocs.length; i++) {
                    await this.client.delete(oldDocs[i].id)
                    this.progressbar.tick()
                }

                console.info(chalk`-- {magenta [%s]} %d docs removed`, timestamp(), oldDocs.length)
            } catch(error) {
                console.error(chalk`-- {magenta [%s]} {red error while removing docs: %s}`, timestamp(), error)
            }
        } else {
            console.info(chalk`-- {magenta [%s]} %d docs removed`, timestamp(), oldDocs.length)
        }

        if(newFiles.length) {
            this.progressbar.createProgressbar('indexing files', newFiles.length)

            try {
                for(let i = 0; i < newFiles.length; i++) {
                    await this.index(newFiles[i])
                    this.progressbar.tick()
                }

                console.info(chalk`-- {magenta [%s]} %d docs inserted`, timestamp(), newFiles.length)
            } catch (error) {
                console.error(chalk`-- {magenta [%s]} {red error while indexing: %s}`, timestamp(), error)
            }
        } else {
            console.info(chalk`-- {magenta [%s]} %d docs inserted`, timestamp(), newFiles.length)
        }

        console.info(chalk`-- {magenta [%s]} import finished`, timestamp())
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
                    this.progressbar.tick()
                    return resolve(file)
                }

                checksum.file(`${file.directory}/${file.filename}`, { algorithm: 'md5' }, (err, hash) => {
                    if(err) {
                        return reject(err)
                    }

                    this.cacher.set(`${file.directory}/${file.filename}`, hash)
                    file.checksum = hash
                    this.progressbar.tick()
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
}