/*
* FurAffinity for NodeJS
* Supports getting most recent results and searching up content
*/

import Parser from './Parser'
import Retrieve from './Retrieve'

function recent(type, limit) {
    return new Promise((resolve, reject) => {
        if (type < 0 || type > types.length - 1) return reject(new Error('Not a valid type!'))
        Retrieve.home().then(data => {
            Parser.recents(data, type, limit).then(x => {
                resolve(x)
            }).catch(err => reject(err))
        }).catch(err => {
            reject(err)
        })
    })
}

function search(query, limit) {
    return new Promise((resolve, reject) => {
        Retrieve.search(query).then(data => {
            Parser.search(data, limit).then(x => {
                resolve(x)
            }).catch(err => reject(err))
        }).catch(err => {
            reject(err)
        })
    })
}

const types = {
    artwork: 0,
    writing: 1,
    music: 2,
    crafts: 3,
    any: 4
}

export default {
    types, recent, search
}

export {
    types, recent, search
}
