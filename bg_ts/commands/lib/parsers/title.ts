import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'

export default class TitleParser implements ParserModule {
    name: 'Title'
    
    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        metadata.set('title', file.filename
            .replace(/[\s_\-.]+/g, ' ')
            .replace(/(jpe?g|png|gif|webm|mpg|mp4|avi)/g, '')
            .replace(/[\s]{2,}/g, ' ')
        )

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
