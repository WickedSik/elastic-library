import { handleError } from '../index'
import elasticsearch, { GetParams, DeleteDocumentParams } from 'elasticsearch'
import Client from '../../includes/client'

const client = new elasticsearch.Client({
    host: 'localhost:9200'
})

const ownClient = new Client({
    index: 'media',
    search: {
        host: 'localhost:9200'
    }
})

export const search = (query:any) =>
    new Promise((resolve, reject) => {
        console.info('-- search:json', JSON.stringify(query))
        client.search({
            ...query
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const update = (params:any) =>
    new Promise((resolve, reject) => {
        client.update(params).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const fetch = (id:GetParams) =>
    new Promise((resolve, reject) => {
        client.get(id).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const deleteDocument = (id:DeleteDocumentParams) =>
    new Promise((resolve, reject) => {
        client.delete(id).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const renameKeyword = (oldKeyword:string, newKeyword:string) =>
    new Promise((resolve, reject) => {
        client.updateByQuery({
            index: 'media',
            type: 'media',
            body: {
                query: {
                    term: {
                        'keywords.keyword': oldKeyword
                    }
                },
                script: {
                    source: `
                        ctx._source.keywords.remove(
                            ctx._source.keywords.indexOf(params.oldKeyword)
                        );
                        ctx._source.keywords.add(params.newKeyword)
                    `,
                    params: {
                        oldKeyword,
                        newKeyword
                    },
                    lang: 'painless'
                }
            }
        }).then((response:any) => {
            resolve(response)
        }).catch((error:any) => {
            reject(handleError(error))
        })
    })

export const scroll = async (query:any):Promise<any[]> =>
    new Promise((resolve, reject) => {
        ownClient.scroll({
            index: 'media',
            type: 'media',
            body: query
        }).then((data:any[]) => {
            resolve(data)
        }).catch((error:any) => {
            reject(error)
        })
    })

export const getSummary = async (includes = ['checksum'], excludeQuery = false) => {
    const query:any = {
        _source: {
            includes
        },
        sort: '_doc'
    }

    if (excludeQuery) {
        query.query = excludeQuery
    }

    const docs:any[] = await scroll(query);
    if (docs.length === 0) {
        return [];
    }
    return docs.map(doc => ({ id: doc._id, ...doc._source }));
}

export default {
    search,
    update,
    fetch,
    deleteDocument,
    renameKeyword,
    scroll,
    getSummary
}
