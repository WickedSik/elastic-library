import { set as _set } from 'lodash'

export type SearchResultHit {
    _id:string
    _source: {
        checksum:string
        file?: {
            path:string
        }
    }
}

type GeneralDocument = {
    file: {
        name: string
        extension: string
        filename: string
        path: string
        created_at: string
        updated_at: string
        size: number
    }
    keywords: string[]
    numbers: string[]
    title?: string
    author?: string
    checksum: string
}
type ImageDocument = GeneralDocument & {
    exif?: {
        image?: any
        thumbnail?: any
        exif?: any
        gps?: any
        interoperability?: any
        makernote?: any
    }
    image: {
        format: string
        width: number
        height: number
        space: string
        channels: number
        depth: string
        chromaSubsampling: string
        isProgressive: boolean
        hasProfile: boolean
        hasAlpha: boolean
        palette?: {
            Vibrant?: string
            LightVibrant?: string
            DarkVibrant?: string
            Muted?: string
            LightMuted?: string
            DarkMuted?: string
        }
        thumbnail?: string
        keywords?: string[]
    }
}
type VideoDocument = GeneralDocument & {
    image?: {
        thumbnail?: string
    }
    video: {
        width: string
        height: string
        aspect: string
        framerate: string
        duration: string
        encoder: string
    }
}

export type Document = ImageDocument | VideoDocument
export type IndexedDocument = {
    _index: string
    _type: string
    _score?: number
    _id: string
    _source: Document
}

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
