import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'
import * as fs from 'fs'

export default class StatsParser implements ParserModule {
    name: 'Stats'
    
    run(file: StoredFile): Promise<Metadata> {
        return new Promise((resolve, reject) => {
            const metadata = new Metadata()

            fs.stat(file.realpath, (err, stats) => {
                if(err) {
                    return reject(err)
                }

                metadata.set('file.created_at', stats.birthtime)
                metadata.set('file.updated_at', stats.mtime)
                metadata.set('file.size', stats.size)

                resolve(metadata)
            })
        })
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
