import _ from 'lodash'
import url from 'url'
import SearchApi from '../redux/api/search'

/**
 * {
        _index: "media",
        _type: "media",
        _id: "AWI-Ba_QEDPZlr1t9Qe_",
        _version: 1,
        found: true,
        _source: {
            file: {
                name: "1491766607.gorshapendragon_АНАЛЬЩИНА",
                extension: ".png",
                filename: "1491766607.gorshapendragon_АНАЛЬЩИНА.png",
                path: "/Volumes/SMALLCAKES/Personal/Images/FurAffinity/1491766607.gorshapendragon_АНАЛЬЩИНА.png",
                created_at: "2017-04-11T21:49:34.000Z",
                updated_at: "2017-04-11T21:49:34.000Z",
                size: 163205
            },
            keywords: [
                "FurAffinity"
            ],
            checksum: "dccfa91972c7784912e939da8a6f49cfe58588ce",
            favorite: false
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
        this.notifiers.forEach(note => note.fire())
    }

    addNotifier(note) {
        this.notifiers.push(note)
    }
}
