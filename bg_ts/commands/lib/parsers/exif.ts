import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'
import Exif from 'exif'

export default class ExifParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        return new Promise((resolve, reject) => {
            new Exif(`${file.directory}/${file.filename}`, (error, data) => {
                const metadata = new Metadata()

                if(error) {
                    // we ignore errors, because exif is less important
                    // than the actual file
                    return resolve(metadata)
                }

                metadata.set('exif', this.validate(data))

                resolve(metadata)
            })
        })
    }

    accepts(file:StoredFile):boolean {
        return /(jpe?g)$/.test(file.filename)
    }

    validate(value:any):any {
        if(value instanceof Buffer) {
            return value.toString('utf8')
        }

        if(Array.isArray(value)) {
            let primitive = true

            value.forEach((v, k) => {
                if(typeof(v) === 'object' || Array.isArray(v)) {
                    primitive = false
                }

                value[k] = this.validate(v)
            })

            if(primitive) {
                value = value.join('')
            }
        } else if(typeof(value) === 'object') {
            for(const key of Object.keys(value)) {
                value[key] = this.validate(value[key])
            }
        }

        return value
    }
}
