import elastic, { PingParams, IndexDocumentParams, UpdateDocumentParams, SearchParams } from 'elasticsearch'
import _ from 'lodash'

export default class Client {
    _index:string
    _mapping:any[]
    _client:elastic.Client

    constructor(config:any) {
        this._index = config.index
        this._mapping = [
            { // always used
                favorite: {
                    type: 'boolean'
                }
            }
        ]
        this._client = new elastic.Client(config.search)
    }

    ping(opt:PingParams) {
        return this._client.ping(opt)
    }

    get indices() {
        return this._client.indices
    }

    index(opt:IndexDocumentParams<any>) {
        return this._client.index(opt)
    }

    update(opt:UpdateDocumentParams) {
        return this._client.update(opt)
    }

    delete(id:string) {
        return this._client.delete({
            index: this._index,
            type: 'media',
            id
        })
    }

    search(opt:SearchParams) {
        return this._client.search(opt)
    }

    scroll(opt:any):Promise<any[]> {
        let documents:any[] = []
        const client = this._client

        return new Promise((resolve, reject) => {
            client.search({
                index: this._index,
                type: 'media',
                scroll: '30s',
                size: 250,
                ...opt
            }, function untildone(error, response) {
                if (error) {
                    reject(error)
                }

                // console.info('-- response', response)

                documents = _.concat(documents, response.hits.hits)

                if (response.hits.total > documents.length) {
                    client.scroll({
                        scrollId: response._scroll_id as string,
                        scroll: '30s'
                    }, untildone)
                } else {
                    resolve(documents)
                }
            })
        })
    }
}
