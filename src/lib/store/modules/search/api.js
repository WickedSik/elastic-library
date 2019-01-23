import { handleError } from '../index'
import elasticsearch from 'elasticsearch'
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

export const search = (query) =>
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

export const update = (params) =>
    new Promise((resolve, reject) => {
        client.update(params).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const fetch = (id) =>
    new Promise((resolve, reject) => {
        client.get(id).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const deleteDocument = (id) =>
    new Promise((resolve, reject) => {
        client.delete(id).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const renameKeyword = (oldKeyword, newKeyword) =>
    new Promise((resolve, reject) => {
        client.updateByQuery({
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
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export const scroll = (query) =>
    new Promise((resolve, reject) => {
        ownClient.scroll({
            index: this._index,
            type: 'media',
            body: query
        }).then(data => {
            resolve(data)
        }).catch(error => {
            reject(error)
        })
    })

export const getSummary = (includes = ['checksum']) =>
    scroll({
        _source: {
            includes
        },
        sort: '_doc'
    }).then(docs => {
        if (docs.length === 0) {
            return []
        }
        return docs
            .map(doc => ({ id: doc._id, ...doc._source }))
    })

export default {
    search,
    update,
    fetch,
    deleteDocument,
    renameKeyword,
    scroll,
    getSummary
}
