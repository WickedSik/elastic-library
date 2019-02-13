import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../storage'

export default class HentaiFoundryParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        if(file.filename.indexOf('-') > -1) {
            let [author, code, ...title] = file.filename.split('-')

            const finalTitle = title.join('-')
            
            metadata.set('author', author)
            metadata.set('title', finalTitle.replace(/_/g, ' '))
            metadata.set('keywords', [code, author])
        }

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
