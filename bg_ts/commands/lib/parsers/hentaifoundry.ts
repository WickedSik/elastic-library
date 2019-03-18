import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'

export default class HentaiFoundryParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        let [ext, ...filename] = file.filename.split('.').reverse()
        let [author, code, ...title] = filename.reverse().join('').split('-')

        const finalTitle = title.join('-')
        
        metadata.set('author', author)
        metadata.set('title', finalTitle.replace(/_/g, ' '))
        metadata.set('keywords', [code, author])

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return file.filename.indexOf('-') > -1
    }
}
