import { Parser } from 'xml2js'
import sites, { Site } from './sites'
import fetch, { Response } from 'cross-fetch'
import promisify from './promisify'

export interface SearchOptions {
    limit:number
}

export interface ImageCommon {
    file_url:string
    id:string
    tags:string[] | string
    score:number | string
    source:string
    rating:string
} 

export interface Image extends ImageCommon {
    common:ImageCommon
    [key:string]: any
}

export class BooruError extends Error {
    name = 'BooruError'

    constructor(message:string) {
        super(message || 'Error message unspecified.')
    }
}

export default class Booru {
    parser:Parser

    constructor() {
        this.parser = new Parser()
    }

    /**
     * Parse images xml to json, which can be used with js
     */
    jsonfy(images: Image[]): Promise<Image[]> {
        return new Promise((resolve, reject) => {
        // If it's an object, assume it's already jsonfied
            if (typeof images !== 'object') {
                this.parser.parseString(images, (err:any, res:any) => {
                    if (err) { return reject(err) }

                    if (res.posts.post !== undefined) {
                        resolve(res.posts.post.map((val:any) => val.$))
                    } else {
                        resolve([])
                    }
                })
            } else resolve(images)
        })
    }

    /**
     * Takes an array of images and converts to json is needed, and add an extra property called "common" with a few common properties
     * Allow you to simply use "images[2].common.tags" and get the tags instead of having to check if it uses .tags then realizing it doesn't
     * then having to use "tag_string" instead and aaaa i hate xml aaaa
     */
    commonfy(images: Image[]): Promise<Image[]> {
        return new Promise((resolve, reject) => {
            if (typeof images[0] === 'undefined') {
                return reject(new BooruError('You didn\'t give any images'))
            }

            this.jsonfy(images)
                .then(this.createCommon)
                .then(resolve)
                .catch(e => reject(new BooruError('This function should only receive images: ' + e)))
        })
    }

    /**
     * Create the .common property for each {@link Image} passed and removes images without a link to the image
     */
    createCommon(images: Image[]): Promise<Image[]> {
        return new Promise((resolve, reject) => {
            const finalImages = []
            for (let i = 0; i < images.length; i++) {
                const tag_rating:RegExpExecArray|null = /(safe|suggestive|questionable|explicit)/i.exec(images[i].tags as string)
                const tags = ((images[i].tags !== undefined) 
                    ? (images[i].tags as string).split(' ')
                    : images[i].tag_string.split(' ')).map((v:string) => v.replace(/,/g, '').replace(/ /g, '_'))

                images[i].common = {
                    file_url: images[i].file_url || images[i].image,
                    id: images[i].id.toString(),
                    tags,
                    score: parseInt(images[i].score as string),
                    source: images[i].source,
                    rating: images[i].rating || (tag_rating && tag_rating[0] as string) as string
                }

                if (images[i].common.rating === 'suggestive') {
                    images[i].common.rating = 'q' // i just give up at this point
                }
                images[i].common.rating = images[i].common.rating.charAt(0)

                if (images[i].common.file_url === undefined) {
                    images[i].common.file_url = images[i].source
                }

                // if the image's file_url is *still* undefined or the source is empty or it's deleted: don't use
                // thanks danbooru *grumble grumble*
                if (images[i].common.file_url === undefined || images[i].common.file_url.trim() === '' || images[i].is_deleted) {
                    continue
                }

                if (images[i].common.file_url.startsWith('/data')) {
                    images[i].common.file_url = 'https://danbooru.donmai.us' + images[i].file_url
                }

                if (images[i].common.file_url.startsWith('/cached')) {
                    images[i].common.file_url = 'https://danbooru.donmai.us' + images[i].file_url
                }

                if (images[i].common.file_url.startsWith('/_images')) {
                    images[i].common.file_url = 'https://dollbooru.org' + images[i].file_url
                }

                if (images[i].common.file_url.startsWith('//derpicdn.net')) {
                    images[i].common.file_url = 'https:' + images[i].image
                }

                if (!images[i].common.file_url.startsWith('http')) {
                    images[i].common.file_url = 'https:' + images[i].file_url
                }

                // lolibooru likes to shove all the tags into its urls, despite the fact you don't need the tags
                if (images[i].common.file_url.match(/https?:\/\/lolibooru.moe/)) {
                    images[i].common.file_url = images[i].sample_url.replace(/(.*booru \d+ ).*(\..*)/, '$1sample$2')
                }

                finalImages.push(images[i])
            }

            resolve(finalImages)
        })
    }

    /**
     * Check if `site` is a supported site (and check if it's an alias and return the sites's true name)
     */
    resolveSite(siteToResolve: string):string|undefined {
        if (typeof siteToResolve !== 'string') { return undefined }

        siteToResolve = siteToResolve.toLowerCase()

        for (let site in sites) {
            if (site === siteToResolve || sites[site].aliases.includes(siteToResolve)) {
                return site
            }
        }

        return undefined
    }

    /**
     * Searches a site for images with tags and returns the results
     * @example
     * booru.search('e926', ['glaceon', 'cute'])
     * //returns a promise with the latest cute glace pic from e926
     */
    search(site: string, tags: string[] = [], { limit }: SearchOptions = { limit: 1 }): Promise<any> {
        return new Promise((resolve, reject) => {
            let s = this.resolveSite(site)

            if (typeof(s) === 'undefined') {
                return reject(new BooruError('Site not supported'))
            }

            if (!(tags instanceof Array)) {
                return reject(new BooruError('`tags` should be an array'))
            }

            if (typeof limit !== 'number' || Number.isNaN(limit)) {
                return reject(new BooruError('`limit` should be an int'))
            }

            resolve(this.searchPosts(s, tags, { limit }))
        })
    }

    /**
     * Actual searching code
     */
    private async searchPosts(site: string, tags: Array<any>, { limit }:SearchOptions = { limit: 1 }): Promise<any> {
        // derpibooru requires '*' to show all images
        if (tags[0] === undefined && site === 'derpibooru.org') { tags[0] = '*' }

        // derpibooru requires spaces instead of _
        if (site === 'derpibooru.org') { tags = tags.map(v => v.replace(/_/g, '%20')) }

        tags = tags.map(encodeURIComponent)

        let siteConfig:Site = sites[site]
        let protocol = siteConfig.https ? 'https' : 'http'
        let uri = `${protocol}://${site}${sites[site].api}${(sites[site].tagQuery) ? sites[site].tagQuery : 'tags'}=${tags.join('+')}&limit=${limit}`
        let options:any = {
            headers: {'User-Agent': 'Booru, a node package for booru searching (by AtlasTheBot)'},
            gzip: true
        }

        if(sites[site].xml) {
            options.xml = true
        } else {
            options.json = true
        }

        try {
            const result = await fetch(uri, options)
            if(sites[site].xml) {
                const xml:string = await result.text()
                const data = await promisify(this.parser.parseString, xml)

                if(data && data.posts) {
                    if(data.posts.$.count > 0) {
                        const posts = data.posts.post.map((post:any) => post.$)

                        return Array.isArray(posts) ? posts[0] : posts
                    }
                    return {}
                } else {
                    // console.info('-- %s:xml', site, data)
                    return {}
                }
            } else {
                const json = await result.json()
    
                return Array.isArray(json) ? json[0] : json
            }
        } catch(err) {
            throw err
        }
    }

    /**
     * For some reason, this won't return anything but `null`
     */
    show(site: string, md5: string) {
        return new Promise((resolve, reject) => {
            let s = this.resolveSite(site)

            if(typeof(s) === 'undefined') {
                throw `Unknown site: ${site}`
            }

            let uri = `https://${s}${s[site].api.replace('index', 'show')}md5=${md5}`
            let options = {
                headers: {
                    'User-Agent': 'Booru, a node package for booru searching (by AtlasTheBot)'
                }
            }

            fetch(uri, options)
                .then((result:any) => result.json())
                .then(resolve)
                .catch((err:any) => reject(new BooruError((err.error && err.error.message) || err.error || err)))
        })
    }
}
