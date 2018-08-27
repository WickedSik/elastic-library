import _ from 'lodash'
import url from 'url'
import SearchApi from '../redux/api/search'

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

export default class Document {
    constructor(props) {
        const self = this

        this.index = props._index
        this.type = props._type
        this.id = props._id
        this.version = props._version
        this.exists = props.found || true
        this.original = props._source
        this.attributes = new Proxy(this.original, {
            get(target, prop, receiver) {
                return Reflect.get(...arguments)
            },
            set(target, prop, value) {
                _.set(self.dirty, prop, value)
                return Reflect.set(...arguments)
            }
        })
        this.dirty = {}

        this.notifiers = []
    }

    set(deepProp, value) {
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
        }).then(results => {
            this.original = {
                ...this.original,
                ...this.dirty
            }

            this.dirty = {}

            this.version = results._version

            this.fireNotifiers()
        })
    }

    get url() {
        const imageUrl = window.require
            ? url.format({
                pathname: encodeURI(this.attributes.file.path),
                protocol: 'image:',
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

    fireNotifiers() {
        this.notifiers.forEach(note => note())
    }

    addNotifier(note) {
        this.notifiers.push(note)
    }
}
