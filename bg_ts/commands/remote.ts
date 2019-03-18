import checksum from 'checksum'
import path from 'path'

import { Task } from '../process'
import Cacher from './lib/cacher'
import visualize from './lib/utils/visualize'
import Parser, { Metadata } from './lib/parser'
import Elastic, { IndexResult } from './lib/elastic'
import Booru from './lib/utils/booru'
import { StoredFileExtra } from './declarations/files'
import Logger from './lib/utils/logger'
import Storage from './lib/storage'

export default class Remote implements Task {
    name:string = 'remote'
    description:string = 'Parses and checks remote sites for metadata'

    cacher:Cacher
    client:Elastic
    booru:Booru

    constructor() {
        this.cacher = new Cacher('checksum')
        this.client = new Elastic()
        this.booru = new Booru()
    }

    async run(parameters:string[], logger:Logger):Promise<any> {
        if(parameters.length === 0) {
            throw 'No file given'
        }

        const [filename, ...directory] = parameters[0].split(path.sep).reverse()
        const document:StoredFileExtra = { 
            directory: Storage.normalize(directory.reverse().join(path.sep)), 
            filename: Storage.normalize(filename),
            realpath: parameters[0]
        }
        
        const sum:string = await new Promise<string>((resolve, reject) => {
            checksum.file(parameters[0], { algorithm: 'md5' }, (err, hash) => {
                if(err) {
                    return reject(err)
                }
                resolve(hash)
            })
        })

        document.titleSum = filename.substr(0, filename.lastIndexOf('.'))
        document.checksum = sum

        logger.info('')
        visualize(logger, 'document', document)

        Object.freeze(document)

        const sites = ['e621', 'danbooru', 'rule34', 'paheal']

        try {
            // FIXME(jurrien) Try to get rid of this...
            const parser = new Parser()
            const metadata = await parser.run(document)
            // NOTE(jurrien) This will prevent the file from being indexed again
            metadata.set('checksum', document.checksum)
            // NOTE(jurrien) Preparing the keywords
            metadata.add('keywords', ['checked_on_booru'])

            logger.info('')

            const found = await this.client.find(document.checksum)
            if(found.hits.total > 0) {
                const id = found.hits.hits[0]._id

                // read the booru's
                for(let site of sites) {
                    const m = await this.check(site, document)
                    visualize(logger, site, m.size() > 0)

                    metadata.setAll(m.getAll())
                }

                const keywords:string[] = metadata.get('keywords')
                if(keywords) {
                    metadata.set('keywords', keywords
                        .filter(value => !!value)
                        .filter((value, index, array) => array.indexOf(value) === index)
                    )
                }

                // console.log('')
                // visualize('metadata', metadata.getAsTree())
                
                const indexed:IndexResult = await this.client.update(id, metadata.getAsTree())
                logger.info('')
                logger.info('updated document media/media/%s', id)
            } else {
                logger.info('document is unknown, import it first using the `meta` command')
            }

        } catch(e) {
            throw e
        } finally {
            logger.info('\nfinished!')
        }
    }

    private async check(site:string, file:StoredFileExtra):Promise<Metadata> {
        const metadata = new Metadata()
        let results = await this.booru.search(site, [`md5:${file.checksum}`], { limit: 1 })

        if(!results || Object.keys(results).length == 0) {
            // try again
            results = await this.booru.search(site, [`md5:${file.titleSum}`], { limit: 1 })
            
            if(!results || Object.keys(results).length == 0) {
                return metadata
            }
        }

        if(results.artist) {
            metadata.set('author', results.artist.join(''))
        }

        if(results.tags) {
            metadata.add('keywords', results.tags.split(/\s+/g))
        }
        if(results.tag_string_general) {
            metadata.add('keywords', results.tag_string_general.split(/\s+/g))
        }

        if(results.source) {
            metadata.set('source', results.source)
        }
        if(results.status) {
            metadata.set('status', results.status)
        }
        if(results.rating) {
            switch (results.rating) {
                case 'q': 
                    metadata.set('rating', 'questionable')
                    break
                case 's': 
                    metadata.set('rating', 'safe')
                    break
                case 'e': 
                    metadata.set('rating', 'explicit')
                    break
            }
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 1500)
        })

        return metadata
    }
}