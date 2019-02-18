import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../storage'
import { generateThumbnail } from 'thumbsupply'
import * as fs from 'fs'

export default class VideoThumbParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        return new Promise((resolve, reject) => {
            const metadata = new Metadata()

            generateThumbnail(`${file.directory}/${file.filename}`, {
                timestamp: '10%',
                forceCreate: true
            }).then((thumbnail:string) => {
                fs.readFile(thumbnail, (err, buffer:Buffer) => {
                    if(err) {
                        console.error('-- video-thumb-parser (%s) %s', file.filename, err)
                        return reject(err)
                    }

                    metadata.set('image', {
                        thumbnail: buffer.toString('base64')
                    })

                    resolve(metadata)
                })
            })
        })
    }

    accepts(file:StoredFile):boolean {
        return /(.+)\.(webm|mp4|mpg|avi)/.test(file.filename)
    }
}