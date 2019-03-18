import { set as _set } from 'lodash'

import DeviantArtParser from './parsers/deviantart'
import VideoParser from './parsers/video'
import VideoThumbParser from './parsers/video-thumb'
import TitleParser from './parsers/title'
import StatsParser from './parsers/stats'
import PathParser from './parsers/path'
import NumberParser from './parsers/number'
import HentaiFoundryParser from './parsers/hentaifoundry'
import FurAffinityParser from './parsers/furaffinity'
import ExifParser from './parsers/exif'
import ImageParser from './parsers/image'
import { StoredFile } from '../declarations/files'
import { Metadata } from '../declarations/search'
export { Metadata } from '../declarations/search'

export interface ParserModule {
    run(file:StoredFile):Promise<Metadata>
    accepts(file:StoredFile):boolean
}

export default class Parser implements ParserModule {
    modules:ParserModule[]

    constructor(modules:ParserModule[] = []) {
        if(modules.length > 0) {
            this.modules = modules
        } else {
            this.modules = [
                new PathParser({
                    ignored: ['Volumes', 'SMALLCAKES', 'Personal', 'Images', 'BIGCAKES', 'Sets']
                }),
                new StatsParser(),
                new NumberParser(),
                new TitleParser(),
                new ExifParser(),
                new DeviantArtParser(),
                new FurAffinityParser(),
                new HentaiFoundryParser(),
                new ImageParser(),
                new VideoParser(),
                new VideoThumbParser()
            ]
        }
    }

    async run(file:StoredFile):Promise<Metadata> {
        return Promise.all(this.modules.map(async module => {
            try {
                return module.accepts(file) ? await module.run(file) : new Metadata()
            } catch(error) {
                return new Metadata()
            }
        })).then((allData:Metadata[]) => {
            return allData.reduce((prev:Metadata, value:Metadata) => {
                return prev.setAll(value.getAll())
            })
        }).catch((error:Error) => {
            console.error('failed while running parser', error)
            console.error(error.stack)

            throw error
        })
    }

    accepts(file:StoredFile):boolean {
        return true
    }
}
