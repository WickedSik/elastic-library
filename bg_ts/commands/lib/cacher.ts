import * as fs from 'fs'
import { join as pathJoin } from 'path'

export default class Cacher {
    cacheDirectory:string = '.elastic-cache'

    constructor() {
        this.initCacheDirectory()
    }

    initCacheDirectory():void {
        const home:string = process.env.HOME
        const cachePath:string = pathJoin(home, this.cacheDirectory)

        fs.exists(cachePath, (exists) => {
            if(!exists) {
                fs.mkdir(cachePath, (err) => {
                    if(err) {
                        console.error('-- failed to create cachedirectory: %s', cachePath)
                    }
                })
            }
        })
    }
}
