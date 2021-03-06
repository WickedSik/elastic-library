import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'

export default class DeviantArtParser implements ParserModule {
    name: 'Deviant Art'

    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        let [ext, ...filename] = file.filename.split('.').reverse()
        let [title, author] = filename.reverse().join('').split('_by_')
        author = author.split('-').shift()

        metadata.set('author', author)
        metadata.set('title', title.replace(/_/g, ' '))
        metadata.set('keywords', [author])

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return file.filename.indexOf('_by_') > -1
    }
}
