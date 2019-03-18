import { Client, SearchResponse, DeleteDocumentResponse, ShardsResponse } from 'elasticsearch'
import { Document, IndexedDocument } from '../declarations/search'

export interface IndexResult { 
    _index: string
    _type: string
    _id: string
    _version: number
    result: string
    _shards: ShardsResponse
    created: boolean
}

export interface SummaryResult {
    id: string
    [key:string]: any
}

export default class Elastic {
    client:Client

    constructor() {
        this.client = new Client({
            host: 'localhost:9200'
        })
    }

    find(checksum:string):Promise<SearchResponse<Document>> {
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
        return this.client.update({
            index: 'media',
            type: 'media',
            id: id,
            body: {
                doc: data
            }
        })
    }

    delete(id:string):Promise<DeleteDocumentResponse> {
        return this.client.delete({
            index: 'media',
            type: 'media',
            id: id
        })
    }

    search(query:object):Promise<SearchResponse<Document>> {
        return new Promise((resolve, reject) => {
            this.client.search({
                index: 'media',
                type: 'media',
                body: query
            }).then((data:SearchResponse<Document>) => {
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    }

    scroll(query:object):Promise<IndexedDocument[]> {
        const documents:IndexedDocument[] = []
        const client:Client = this.client

        return new Promise((resolve, reject) => {
            client.search({
                index: 'media',
                type: 'media',
                scroll: '30s',
                size: 1000,
                body: query
            }, function untilldone(error: any, response: SearchResponse<Document>) {
                if(error) {
                    return reject(error)
                }

                response.hits.hits.forEach(hit => {
                    documents.push(hit)
                })

                if(response.hits.total > documents.length) {
                    client.scroll({
                        scrollId: response._scroll_id,
                        scroll: '30s'
                    }, untilldone)
                } else {
                    resolve(documents)
                }
            })
        })
    }

    async getSummary(includes:string[] = ['checksum'], query?:any):Promise<SummaryResult[]> {
        const finalQuery:any = {
            _source: {
                includes
            },
            sort: '_doc'
        }
    
        if (query) {
            finalQuery.query = query
        }
    
        return this.scroll(finalQuery).then(docs => {
            if (docs.length === 0) {
                return []
            }
            return docs
                .map((doc:any) => ({ id: doc._id, ...doc._source } as SummaryResult))
        })
    }
}
