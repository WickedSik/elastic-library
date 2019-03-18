import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'
import { generateThumbnail } from 'thumbsupply'
import fs from 'fs'
import path from 'path'

export default class VideoThumbParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        return new Promise(async (resolve, reject) => {
            const metadata = new Metadata()

            try {
                const thumbnail = await this.create10PercentThumbnail(file.realpath)
                
                fs.readFile(thumbnail, (err, buffer:Buffer) => {
                    if(err) {
                        return reject(err)
                    }
    
                    metadata.set('image', {
                        thumbnail: buffer.toString('base64')
                    })
    
                    resolve(metadata)
                })
            } catch(err) {
                try {
                    const thumbnail = await this.create0FrameThumbnail(file.realpath)
                    
                    fs.readFile(thumbnail, (err, buffer:Buffer) => {
                        if(err) {
                            return reject(err)
                        }
        
                        metadata.set('image', {
                            thumbnail: buffer.toString('base64')
                        })
        
                        resolve(metadata)
                    })
                } catch(err) {
                    return reject(err)
                }
            }
        })
    }

    async create10PercentThumbnail(filepath:string):Promise<string> {
        return generateThumbnail(filepath, {
            timestamp: '10%',
            forceCreate: true
        })
    }

    async create0FrameThumbnail(filepath:string):Promise<string> {
        return generateThumbnail(filepath, {
            timestamp: 0,
            forceCreate: true
        })
    }

    accepts(file:StoredFile):boolean {
        return /(.+)\.(webm|mp4|mpg|avi)/.test(file.filename)
    }
}