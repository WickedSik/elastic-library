import { Task } from '../process'
import Parser, { ParserModule } from './lib/parser'
import checksum from 'checksum'
import { StoredFile } from './lib/storage'
import Elastic, { IndexResult } from './lib/elastic'
import visualize from './lib/utils/visualize'

export default class Meta implements Task {
    name:string = 'meta'
    description:string = 'Parses and displays information of one file'
    
    client:Elastic

    constructor() {
        this.client = new Elastic()
    }

    async run(parameters:string[]):Promise<any> {
        if(parameters.length === 0) {
            throw 'No file given'
        }

        const [filename, ...directory] = parameters[0].split('/').reverse()
        const document:StoredFile = { directory: directory.reverse().join('/'), filename }
        
        const sum:string = await new Promise<string>((resolve, reject) => {
            checksum.file(parameters[0], { algorithm: 'md5' }, (err:any, hash:string) => {
                if(err) {
                    return reject(err)
                }
                resolve(hash)
            })
        })

        document.checksum = sum

        console.log('')
        visualize('document', document)

        const parser = new Parser()

        const moduleMap = {}
        parser.modules.forEach((module:ParserModule) => {
            moduleMap[module.constructor.name] = module.accepts(document)
        })

        console.log('')
        visualize('parsers', moduleMap)

        try {
            const metadata = await parser.run(document)
            metadata.set('checksum', document.checksum)

            console.log('')

            const map:object = metadata.getAsTree()
            visualize('metadata', map)

            console.log('')

            const found = await this.client.find(document.checksum)
            if(found.hits.total > 0) {
                const id = found.hits.hits[0]._id
                const indexed:IndexResult = await this.client.update(id, map)

                console.log('updated document media/media/%s', id)
            } else {
                const indexed:IndexResult = await this.client.index(map)

                console.log('indexed document: media/media/%s', indexed._id)
            }

        } catch(e) {
            throw e
        } finally {
            console.log('\nfinished!')
        }
    }
}