import request from 'request'

const endpoint = 'https://www.furaffinity.net/'

export const home = () => {
    return new Promise((resolve, reject) => {
        request(endpoint, function(err, res, body) {
            if (err) return reject(err)
            resolve(body)
        })
    })
}

export const search = (query) => {
    return new Promise((resolve, reject) => {
        request.post({
            url: endpoint + 'search',
            form: {
                q: query
            }
        }, function(err, res, body) {
            if (err) return reject(err)
            resolve(body)
        })
    })
}
