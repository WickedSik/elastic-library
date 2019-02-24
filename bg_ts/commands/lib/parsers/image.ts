import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'
import { default as sharp } from 'sharp'
import Vibrant from 'node-vibrant'

export default class ImageParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        const path = `${file.directory}/${file.filename}`
        
        return Promise.all([
            this.getMetadata(path),
            this.getPalette(path),
            this.getThumbnail(path),
            this.getOtherData(path)
        ]).then(values => {
            const metadata = new Metadata()

            metadata.set('image', {
                ...values[0],
                ...values[1],
                ...values[2],
                ...values[3]
            })

            return metadata
        }).catch(error => {
            console.error('-- image-parser (%s) %s', path, error.message)
            throw error
        })
    }

    accepts(file:StoredFile):boolean {
        return /(jpe?g|png|gif|webp|tiff|svg)$/.test(file.filename)
    }

    getMetadata(path:string) {
        return new Promise((resolve, reject) => {
            sharp(path)
                .metadata()
                .then(($0) => {
                    if ($0.exif) { delete $0.exif }
                    if ($0.icc) { delete $0.icc }
                    if ($0.iptc) { delete $0.iptc }
                    if ($0.xmp) { delete $0.xmp }

                    resolve($0)
                }).catch(e => reject(e))
        })
    }

    getThumbnail(path:string) {
        return new Promise((resolve, reject) => {
            sharp(path)
                .resize(300, 300)
                .jpeg({
                    quality: 60,
                    progressive: true
                })
                .toBuffer()
                .then(buffer => {
                    resolve({ thumbnail: buffer.toString('base64') })
                }).catch((error) => {
                    // no failure to index if the thumb can't be generated
                    reject(error)
                })
        })
    }

    getPalette(path:string) {
        return new Promise((resolve, reject) => {
            Vibrant.from(path)
                .getPalette()
                .then(palette => {
                    const out = {}
                    for (const swatch in palette) {
                        if (palette.hasOwnProperty(swatch) && palette[swatch]) {
                            out[swatch] = palette[swatch].getHex()
                        }
                    }

                    resolve({ palette: out })
                }).catch(() => {
                    resolve()
                })
        })
    }

    getOtherData(path:string) {
        const ext = path.substr(path.lastIndexOf('.'))
        const data = {
            keywords: []
        }

        if (ext === '.gif') {
            data.keywords = ['animated']
        }

        return data
    }
}
