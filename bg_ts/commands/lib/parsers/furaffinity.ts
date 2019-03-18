import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'

export default class FurAffinityParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        let [code, title_author, ext] = file.filename.split('.')
        let [author, ...title] = title_author.split('_')

        const finalTitle = title.join('-')

        metadata.set('author', author)
        metadata.set('title', finalTitle.replace(/_/g, ' '))
        metadata.add('keywords', [code, author])

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return /(.+[_].+)(\.[a-z]{3,})/.test(file.filename)
    }
}
