import { handleError } from './index'
import elasticsearch from 'elasticsearch'

const client = new elasticsearch.Client({
    host: "localhost:9200"
});

const search = (query) => 
    new Promise((resolve, reject) => {
        client.search({
            ...query
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

const update = (params) =>
    new Promise((resolve, reject) => {
        client.update(params).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

const fetch = (id) =>
    new Promise((resolve, reject) => {
        client.get(id).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

const deleteDocument = (id) =>
    new Promise((resolve, reject) => {
        client.delete(id).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export default {
    search,
    update,
    fetch,
    deleteDocument
}