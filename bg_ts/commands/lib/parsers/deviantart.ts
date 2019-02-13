import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../storage'

export default class DeviantArtParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        if(file.filename.indexOf('_by_') > -1) {
            let [title, author] = file.filename.split('_by_')
            author = author.split('-').shift()

            metadata.set('author', author)
            metadata.set('title', title.replace(/_/g, ' '))
            metadata.set('keywords', [author])
        }

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
