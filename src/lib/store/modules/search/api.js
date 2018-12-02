import { handleError } from '../index'
import elasticsearch from 'elasticsearch'

const client = new elasticsearch.Client({
    host: 'localhost:9200'
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

export default {
    search,
    update,
    fetch,
    deleteDocument,
    renameKeyword
}
