import { Client, SearchResponse, DeleteDocumentResponse, ShardsResponse } from 'elasticsearch'

export interface IndexResult { 
    _index:string
    _type:string
    _id:string
    _version:number
    result:string
    _shards:ShardsResponse
    created:boolean
}

export default class Elastic {
    client:Client

    constructor() {
        this.client = new Client({
            host: 'localhost:9200'
        })
    }

    find(checksum:string):Promise<SearchResponse<object>> {
        return this.client.search({
            index: 'media',
            type: 'media',
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { checksum } }
                        ]
                    }
                }
            }
        })
    }

    index(data:any):Promise<IndexResult> {
        if(!data.checksum) {
            throw 'No checksum'
        }
        return this.client.index({
            index: 'media',
            type: 'media',
            body: data
        })
    }

    update(id:string, data:object):Promise<IndexResult> {
        return this.client.index({
            index: 'media',
            type: 'media',
            id: id,
            body: data
        })
    }

    delete(id:string):Promise<DeleteDocumentResponse> {
        return this.client.delete({
            index: 'media',
            type: 'media',
            id: id
        })
    }

    search(query:object):Promise<SearchResponse<any>> {
        return new Promise((resolve, reject) => {
            this.client.search({
                index: 'media',
                type: 'media',
                body: query
            }).then(data => {
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    scroll(query:object):Promise<any[]> {
        const documents:any[] = []
        const client:Client = this.client

        return new Promise((resolve, reject) => {
            client.search({
                index: 'media',
                type: 'media',
                scroll: '30s',
                size: 1000,
                body: query
            }, function untilldone(error: any, response: SearchResponse<any>) {
                if(error) {
                    return reject(error)
                }

                response.hits.hits.forEach(hit => {
                    documents.push(hit)
                })

                if(response.hits.total > documents.length) {
                    client.scroll({
                        scrollId: response._scroll_id as string,
                        scroll: '30s'
                    }, untilldone)
                } else {
                    resolve(documents)
                }
            })
        })
    }
}
