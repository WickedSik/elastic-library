import { Client, SearchResponse, DeleteDocumentResponse } from 'elasticsearch'

export default class Elastic {
    client:Client

    constructor() {
        this.client = new Client({
            host: 'localhost:9200'
        })
    }

    index(data:object):Promise<object> {
        return this.client.index({
            index: 'media',
            type: 'media',
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

    scroll(query:object):Promise<object[]> {
        const documents:object[] = []
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
                        scrollId: response._scroll_id,
                        scroll: '30s'
                    }, untilldone)
                } else {
                    resolve(documents)
                }
            })
        })
    }
}
