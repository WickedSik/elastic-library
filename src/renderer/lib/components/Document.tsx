import _ from 'lodash'
import url from 'url'
import SearchApi from '../store/modules/search/api'

const removeFromArray = function<T>(arr:T[], ...arg:T[]):T[] {
    let L = arg.length
    let ax
    while (L && arr.length) {
        let what = arg[--L]
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1)
        }
    }
    return arr
}

/**
 *  {
        "_index": "media",
        "_type": "media",
        "_id": "AWRsOe8oLZ81I4cnYxr3",
        "_score": 8.735082,
        "_source": {
            "file": {
                "name": "1530598687.gorshapendragon_trakhi",
                "extension": ".png",
                "filename": "1530598687.gorshapendragon_trakhi.png",
                "path": "/Volumes/BIGCAKES/Images/FurAffinity/1530598687.gorshapendragon_trakhi.png",
                "created_at": "2018-07-04T22:37:16.000Z",
                "updated_at": "2018-07-04T22:37:16.000Z",
                "size": 248897
            },
            "keywords": ["FurAffinity", "1530598687", "Gorshapendragon"],
            "numbers": ["1530598687"],
            "author": "Gorshapendragon",
            "title": "Trakhi",
            "image": {
                "format": "jpeg",
                "width": 1280,
                "height": 781,
                "space": "srgb",
                "channels": 3,
                "depth": "uchar",
                "hasProfile": false,
                "hasAlpha": false
            },
            "checksum": "34d66bcb7486e118f885dc127cd622d957359f91",
            "favorite": false
        }
    }
 */

interface DocumentAttributes extends ProxyHandler<any> {
    [key:string]: any
}

interface DocumentPropTypes {
    _index:string
    _type:string
    _id:string
    _version:string
    found:boolean
    _source:DocumentAttributes
}

export default class Document {
    index:string
    type:string
    id:string
    version:string
    exists:boolean
    original:any
    attributes:DocumentAttributes
    dirty:any

    __on:{
        [key:string]: Function[]
    }

    static globalOn(event:string, callback:Function) {
        if (event in Document.__global_listeners) {
            Document.__global_listeners[event].push(callback)
        }
    }

    static globalTrigger(event:string, data:any) {
        if (event in Document.__global_listeners) {
            // eslint-disable-next-line standard/no-callback-literal
            Document.__global_listeners[event].forEach((callback:Function) => callback(this, data))
        }
    }

    static __global_listeners = {
        update: [],
        create: [],
        loaded: []
    }

    constructor(props:DocumentPropTypes) {
        const self = this

        this.index = props._index
        this.type = props._type
        this.id = props._id
        this.version = props._version
        this.exists = props.found || true
        this.original = props._source
        this.attributes = new Proxy(this.original, {
            // get(target, prop, receiver) {
            //     return Reflect.get(...arguments)
            // },
            set(target, prop, value) {
                _.set(self.dirty, prop, value)
                return Reflect.set(target, prop, value)
            }
        })
        this.dirty = {}

        this.__on = {
            update: [],
            create: [],
            loaded: []
        }

        this.trigger('loaded')
    }

    set(deepProp:string, value:any) {
        // doc.set('file.path', value)
        const [firstPart, ...remainingParts] = deepProp.split('.')

        const bit = this.attributes[firstPart]
        _.set(bit, remainingParts.join('.'), value)

        this.attributes[firstPart] = bit
    }

    update() {
        console.log('-- document:update', this.dirty)

        SearchApi.update({
            index: this.index,
            type: this.type,
            id: this.id,
            body: { doc: this.dirty }
        }).then((results:any) => {
            this.original = {
                ...this.original,
                ...this.dirty
            }

            this.dirty = {}

            this.version = results._version

            this.trigger('update')
        })
    }

    get isVideo() {
        return (
            this.attributes.file.extension === '.webm' ||
            this.attributes.file.extension === '.mpg' ||
            this.attributes.file.extension === '.mp4'
        )
    }

    get url() {
        const protocol = this.isVideo ? 'video:' : 'image:'

        const imageUrl = window.require
            ? url.format({
                pathname: encodeURI(this.attributes.file.path),
                protocol,
                slashes: true
            })
            : url.format({
                pathname: encodeURI(this.attributes.file.path),
                protocol: 'file:',
                slashes: true
            })

        return imageUrl
    }

    get thumb() {
        if (this.attributes.image && this.attributes.image.thumbnail) {
            return `data:image/jpeg;base64,${this.attributes.image.thumbnail}`
        }

        const imageUrl = window.require
            ? url.format({
                pathname: encodeURI(this.attributes.file.path),
                protocol: 'image:',
                slashes: true,
                query: {
                    w: 500
                }
            })
            : url.format({
                pathname: encodeURI(this.attributes.file.path),
                protocol: 'file:',
                slashes: true
            })

        return imageUrl
    }

    get title() {
        return this.attributes.title || this.attributes.file.name
    }

    /* Update Handlers */
    on(event:string, callback:Function) {
        if (event in this.__on) {
            this.__on[event].push(callback)
        }
    }

    off(event:string, callback:Function) {
        if (event in this.__on) {
            removeFromArray(this.__on[event], callback)
        }
    }

    trigger(event:string, data:any = null) {
        if (event in this.__on) {
            // eslint-disable-next-line standard/no-callback-literal
            this.__on[event].forEach(callback => callback(this, data))
        }
    }
}
