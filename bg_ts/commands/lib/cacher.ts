import * as fs from 'fs'
import { join as pathJoin } from 'path'

export default class Cacher {
    cacheDirectory:string = '.elastic-cache'
    cache:Map<string, string> = new Map()
    name:string
    private newCount:number = 0

    constructor(name:string) {
        this.name = name
    }

    async initCacheDirectory():Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const home:string = process.env.HOME
            const cachePath:string = pathJoin(home, this.cacheDirectory)

            fs.exists(cachePath, (exists) => {
                if(!exists) {
                    fs.mkdir(cachePath, (err) => {
                        if(err) {
                            console.error('-- failed to create cachedirectory: %s', cachePath)
                            return reject(err)
                        }
                        resolve(true)
                    })
                } else {
                    this.read().then(resolve).catch(err => {
                        throw err
                    })
                }
            })
        })
    }

    get(name:string):string {
        return this.cache.get(name)
    }

    async set(name:string, value:string) {
        if(!name || !value) {
            return
        }

        this.cache.set(name, value)

        if(this.newCount >= 50) {
            try {
                await this.store()
            } catch(err) {
                console.error(err.message, err.stack)
            }
            this.newCount = 0
        }

        this.newCount++
    }

    has(name:string):boolean {
        return this.cache.has(name)
    }

    toString():string {
        return JSON.stringify([...this.cache])
    }

    async save() {
        await this.store()
    }

    private async store():Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const home:string = process.env.HOME
            const filename = `cache-${this.name}.json`
            const cacheFile = pathJoin(home, this.cacheDirectory, filename)

            fs.writeFile(cacheFile, this.toString(), (err) => {
                if(err) {
                    return reject(err)
                }
                resolve(true)
            })
        })
    }

    private async read():Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const home:string = process.env.HOME
            const filename = `cache-${this.name}.json`
            const cacheFile = pathJoin(home, this.cacheDirectory, filename)

            fs.exists(cacheFile, (exists:boolean) => {
                if(exists) {
                    fs.readFile(cacheFile, (err, data) => {
                        if(err) {
                            return reject(err)
                        }

                        this.cache = new Map(JSON.parse(data.toString()))
                        resolve(true)
                    })
                } else {
                    resolve(true)
                }
            })
        })
    }
}
