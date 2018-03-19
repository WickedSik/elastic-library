import { handleError } from './index'
import elasticsearch from 'elasticsearch'

const client = new elasticsearch.Client({
    host: "localhost:9200"
});

const search = (query) => 
    new Promise((resolve, reject) => {
        client.search(query).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

const update = (id, data) =>
    new Promise((resolve, reject) => {
        client.update(id, data).then(response => {
            resolve(response)
        }).catch(error => {
            reject(handleError(error))
        })
    })

export default {
    search,
    update
}