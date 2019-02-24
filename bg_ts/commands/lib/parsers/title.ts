import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'

export default class TitleParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        metadata.set('title', file.filename
            .replace(/[\s_\-.]+/g, ' ')
            .replace(/(jpe?g|png|gif)/g, '')
            .replace(/[\s]{2,}/g, ' ')
        )

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
