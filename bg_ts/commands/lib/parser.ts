import { set as _set } from 'lodash'

import DeviantArtParser from './parsers/deviantart'
import VideoParser from './parsers/video'
import VideoThumbParser from './parsers/video-thumb'
import TitleParser from './parsers/title'
import StatsParser from './parsers/stats'
import PathParser from './parsers/path'
import NumberParser from './parsers/number'
import ImageParser from './parsers/image'
import HentaiFoundryParser from './parsers/hentaifoundry'
import FurAffinityParser from './parsers/furaffinity'
import ExifParser from './parsers/exif';
import { StoredFile } from '../declarations/files';
import Meta from '../meta';

export class Metadata {
    data:Map<string, any>

    constructor() {
        this.data = new Map<string, any>()
    }

    setAll(keyAndValues:Map<string, any>):Metadata {
        const entries = keyAndValues.entries()

        let entry:IteratorResult<[string, any]>
        while(entry = entries.next()) {
            if(entry && entry.value) {
                const [key, value] = entry.value

                if(Array.isArray(value)) {
                    this.add(key, value)
                } else {
                    this.set(key, value)
                }
            } else {
                break
            }
        }
        
        return this
    }

    getAll():Map<string, any> {
        return this.data
    }

    getAsTree():object {
        const map = {}

        const entries = this.data.entries()
        
        let entry:IteratorResult<[string, any]>
        while(entry = entries.next()) {
            if(entry && entry.value) {
                const [key, value] = entry.value
                _set(map, key, value)
            } else {
                break
            }
        }

        return map
    }

    has(key:string):boolean {
        return this.data.has(key)
    }

    get(key:string):any {
        return this.data.get(key)
    }

    set(key:string, value:any):void {
        this.data.set(key, value)
    }

    add(key:string, value:any[]):void {
        if(this.has(key)) {
            const v = this.get(key)

            if(Array.isArray(v)) {
                value.forEach(val => {
                    v.push(val)
                })
            } else {
                const val = [v, ...value]
                this.set(key, val)
            }
        } else {
            this.set(key, value)
        }
    }

    size():number {
        return this.data.size
    }
}

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
