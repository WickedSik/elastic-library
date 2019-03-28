import chalk from 'chalk'
import checksum from 'checksum'

import { Task } from '../process'
import Elastic from './lib/elastic'
import Storage from './lib/storage'
import Parser from './lib/parser'
import Cacher from './lib/cacher'
import Queue, { QueueStatus } from './lib/utils/queue'
import { Checksum, StoredFile } from './declarations/files'
import { SearchResultHit } from './declarations/search'
import { timestamp } from './lib/utils/visualize'
import { Progressbar } from './lib/utils/progressbar'
import Logger from './lib/utils/logger'
import { ConfigJSON } from './declarations/config'

export default class Import implements Task {
    name:string = 'import'
    description:string = 'Imports source directories into Elastic Library'

    private queue:Queue<StoredFile>
    private client:Elastic
    private filesystem:Storage
    private cacher:Cacher
    private progressbar:Progressbar

    constructor(config:ConfigJSON) {
        this.queue = new Queue<StoredFile>()
        this.cacher = new Cacher('checksum')
        this.client = new Elastic(config.search.host)
        this.progressbar = new Progressbar()
        this.filesystem = new Storage(config.media.directories)
    }

    async run(parameters:any[], logger:Logger) {
        logger.info(chalk`-- {magenta [%s]} creating cache directory`, timestamp())
        await this.cacher.initCacheDirectory()

        logger.info(chalk`-- {magenta [%s]} import starting`, timestamp())

        const checksums = await this.checksums()
        logger.info(chalk`-- {magenta [%s]} %d checksums`, timestamp(), checksums.length)

        const files = await this.files(logger)
        logger.info(chalk`-- {magenta [%s]} %d files`, timestamp(), files.length)

        this.progressbar.createProgressbar('calculating checksums', files.length)

        const fileChecksums = await this.fileChecksum(files)
        logger.info(chalk`-- {magenta [%s]} %d file checksums`, timestamp(), fileChecksums.length)
        await this.cacher.save()
        this.progressbar.finish()

        const simpleChecksums:string[] = checksums.map(sum => sum.checksum)
        const newFiles = fileChecksums.filter(file => simpleChecksums.indexOf(file.checksum) === -1)
        
        const simpleFileChecksums:string[] = fileChecksums.map(sum => sum.checksum)
        const oldDocs = checksums.filter(sum => simpleFileChecksums.indexOf(sum.checksum) === -1)
        logger.info(chalk`-- {magenta [%s]} %d new files, %d docs not found as file`, timestamp(), newFiles.length, oldDocs.length)

        const duplicateChecksums = this.duplicates(checksums)
        const duplicateFiles = this.duplicates(fileChecksums.map(file => ({ id: file.realpath, checksum: file.checksum })))
        const missingFiles = await this.missingFiles(checksums)
        logger.info(chalk`-- {magenta [%s]} %d duplicate checksums, %d duplicate files, %d missing files`, timestamp(), duplicateChecksums.length, duplicateFiles.length, missingFiles.length)

        if(oldDocs.length > 0) {
            this.progressbar.createProgressbar('removing old docs', oldDocs.length)

            try {
                for(let i = 0; i < oldDocs.length; i++) {
                    await this.client.delete(oldDocs[i].id)
                    this.progressbar.tick()
                }

                logger.info(chalk`-- {magenta [%s]} %d docs removed`, timestamp(), oldDocs.length)
            } catch(error) {
                logger.error(chalk`-- {magenta [%s]} {red error while removing docs: %s}`, timestamp(), error)
            }
        } else {
            logger.info(chalk`-- {magenta [%s]} %d docs removed`, timestamp(), oldDocs.length)
        }

        if(newFiles.length) {
            this.progressbar.createProgressbar('indexing files', newFiles.length)

            try {
                for(let i = 0; i < newFiles.length; i++) {
                    await this.index(newFiles[i])
                    this.progressbar.tick()
                }

                logger.info(chalk`-- {magenta [%s]} %d docs inserted`, timestamp(), newFiles.length)
            } catch (error) {
                logger.error(chalk`-- {magenta [%s]} {red error while indexing: %s}`, timestamp(), error)
            }
        } else {
            logger.info(chalk`-- {magenta [%s]} %d docs inserted`, timestamp(), newFiles.length)
        }
        
        if(missingFiles.length > 0) {
            this.progressbar.createProgressbar('removing missing files', missingFiles.length)

            try {
                for(let i = 0; i < missingFiles.length; i++) {
                    await this.client.delete(missingFiles[i].id)
                    this.progressbar.tick()
                }

                logger.info(chalk`-- {magenta [%s]} %d docs removed`, timestamp(), missingFiles.length)
            } catch(error) {
                logger.error(chalk`-- {magenta [%s]} {red error while removing docs: %s}`, timestamp(), error)
            }
        } else {
            logger.info(chalk`-- {magenta [%s]} %d docs removed`, timestamp(), missingFiles.length)
        }

        logger.info(chalk`-- {magenta [%s]} import finished`, timestamp())
    }

    async checksums():Promise<Checksum[]> {
        return this.client.scroll({
            _source: {
                includes: ['checksum', 'file.path']
            },
            sort: '_doc'
        }).then(documents => {
            return documents.map((doc:SearchResultHit) => {
                return {
                    id: doc._id,
                    checksum: doc._source.checksum,
                    filepath: doc._source.file.path
                }
            })
        }).catch(error => {
            throw error
        })
    }

    async files(logger:Logger):Promise<StoredFile[]> {
        return this.filesystem.readAll(logger)
    }

    async fileChecksum(files:StoredFile[]):Promise<StoredFile[]> {
        files.forEach((file:StoredFile) => {
            this.queue.add(() => new Promise((resolve, reject) => {
                if(this.cacher.has(file.realpath)) {
                    file.checksum = this.cacher.get(file.realpath)
                    this.progressbar.tick()
                    return resolve(file)
                }

                checksum.file(file.realpath, { algorithm: 'md5' }, (err, hash) => {
                    if(err) {
                        console.error('-- checksum error', err)
                        this.progressbar.tick()
                        return reject(err)
                    }

                    this.cacher.set(file.realpath, hash)
                    file.checksum = hash
                    this.progressbar.tick()
                    return resolve(file)
                })
            }))
        })

        const results = await this.queue.start()

        return results.map((result:QueueStatus<StoredFile>) => {
            if(result.status === 'success') {
                return result.value
            }
            return undefined
        }).filter(r => r)
    }

    async missingFiles(sums:Checksum[]):Promise<Checksum[]> {
        const q = new Queue<Checksum>()

        sums.forEach((sum:Checksum) => {
            q.add(() => {
                return new Promise((resolve, reject) => {
                    this.filesystem.exists(sum.filepath).then((exists:boolean) => {
                        sum.exists = exists
                        return resolve(sum)
                    }).catch((error) => {
                        sum.exists = false
                        return resolve(sum)
                    })
                })
            })
        })

        const results = await q.start()

        return results.map(result => result.value)
            .filter(sum => !sum.exists)
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