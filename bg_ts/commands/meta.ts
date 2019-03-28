import checksum from 'checksum'
import path from 'path'

import { Task } from '../process'
import Parser from './lib/parser'
import Elastic, { IndexResult } from './lib/elastic'
import visualize from './lib/utils/visualize'
import { StoredFile } from './declarations/files'
import Logger from './lib/utils/logger'
import Storage from './lib/storage'
import { ConfigJSON } from './declarations/config';

export default class Meta implements Task {
    name:string = 'meta'
    description:string = 'Parses and displays information of one file'
    
    client:Elastic

    constructor(config:ConfigJSON) {
        this.client = new Elastic(config.search.host)
    }

    async run(parameters:string[], logger:Logger):Promise<any> {
        if(parameters.length === 0) {
            throw 'No file given'
        }

        const [filename, ...directory] = parameters[0].split(path.sep).reverse()
        const document:StoredFile = {
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

        document.checksum = sum

        logger.info('')
        visualize(logger, 'document', document)

        const parser = new Parser()
        const moduleMap = {}
        parser.modules.forEach((module:Parser) => {
            moduleMap[module.constructor.name] = module.accepts(document)
        })

        logger.info('')
        visualize(logger, 'parsers', moduleMap)

        try {
            const metadata = await parser.run(document)
            metadata.set('checksum', document.checksum)

            logger.info('')

            const map:object = metadata.getAsTree()
            visualize(logger, 'metadata', map)

            logger.info('')

            const found = await this.client.find(document.checksum)
            if(found.hits.total > 0) {
                const id = found.hits.hits[0]._id
                const indexed:IndexResult = await this.client.update(id, map)

                logger.info('updated document media/media/%s', id)
            } else {
                const indexed:IndexResult = await this.client.index(map)

                logger.info('indexed document: media/media/%s', indexed._id)
            }

        } catch(e) {
            throw e
        } finally {
            logger.info('\nfinished!')
        }
    }
}