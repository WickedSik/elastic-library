import { handleError } from './index'
import axios from 'axios'

const findPost = (md5, username, password) => 
    new Promise((resolve, reject) => {
        axios.get(`https://e621.net/post/show.json?md5=${md5}&login=${username}&password_hash=${password}`)
            .then(result => {
                if(result.data && result.data.post_id) {
                    resolve(result.data)
                } else {
                    reject(handleError({ message: 'Post Not Found' }))
                }
            })
            .catch(e => {
                reject(handleError(e))
            })
    })

export default {
    findPost
}