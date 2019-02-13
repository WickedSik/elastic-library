import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../storage'

export default class NumberParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        const metadata = new Metadata()

        let matches = file.filename.match(/[0-9]{4,}/g)

        if(matches) {
            matches = matches.map((x) => {
                return `${x}`
            })
        } else {
            matches = []
        }

        metadata.set('numbers', matches)

        return Promise.resolve(metadata)
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
