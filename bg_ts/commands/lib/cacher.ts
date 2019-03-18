import * as fs from 'fs'
import { join as pathJoin } from 'path'

export default class Cacher {
    private cacheDirectory:string = '.elastic-cache'
    private cache:Map<string, string> = new Map()
    private name:string
    private home:string
    private newCount:number = 0

    constructor(name:string) {
        this.name = name
        this.home = process.env.HOME || (process.env.HOMEDRIVE + process.env.HOMEPATH)
    }

    async initCacheDirectory():Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const cachePath:string = pathJoin(this.home, this.cacheDirectory)

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
            const filename = `cache-${this.name}.json`
            const cacheFile = pathJoin(this.home, this.cacheDirectory, filename)

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
            const filename = `cache-${this.name}.json`
            const cacheFile = pathJoin(this.home, this.cacheDirectory, filename)

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
