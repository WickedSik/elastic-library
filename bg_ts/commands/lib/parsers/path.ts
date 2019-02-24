import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'
import * as path from 'path'

interface PathParserConfig {
    ignored?: string[]
}

export default class PathParser implements ParserModule {
    config:PathParserConfig = {
        ignored: []
    }

    constructor(config:PathParserConfig) {
        this.config = config
    }

    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        let pathdata = path.parse(`${file.directory}/${file.filename}`)

        let dirs = pathdata.dir.split(path.sep).filter((i) => {
            return this.config.ignored.indexOf(i) === -1 && i !== ''
        })

        metadata.set('file.name', pathdata.name)
        metadata.set('file.extension', pathdata.ext)
        metadata.set('file.filename', pathdata.name + pathdata.ext)
        metadata.set('file.path', `${file.directory}/${file.filename}`)

        metadata.add('keywords', 
            dirs
                .filter((value, index, array) => array.indexOf(value) === index)
                .map(d => d.toLowerCase())
        )

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
