import { ParserModule, Metadata } from '../parser'
import { StoredFile } from '../../declarations/files'
import { execFile } from 'mz/child_process'

const ACCEPTED_PROPERTIES = [
    'title',
    'aspect',
    'framerate',
    'encoder',
    'duration',
    'width',
    'height'
]

const REPLACE_PROPERTY_NAMES = {
    display_aspect_ratio: 'aspect',
    avg_frame_rate: 'framerate',
    tags_ENCODER: 'encoder',
    tags_DURATION: 'duration'
}

export default class VideoParser implements ParserModule {
    run(file: StoredFile): Promise<Metadata> {
        return new Promise((resolve, reject) => {
            const metadata = new Metadata()

            execFile('ffprobe', [
                '-v', 'error',
                '-of', 'flat=s=_',
                '-select_streams', 'v:0',
                '-show_entries', 'stream',
                `${file.directory}/${file.filename}`
            ])
            .then((result:[string, string]) => {
                const stdout = result[0].toString()
                //   'streams_stream_0_tags_handler_name="VideoHandler"',
                const lines = stdout.split('\n')

                const data = lines.map(curr => {
                    if (curr.length === 0) {
                        return undefined
                    }
                    const [key, value] = curr.split('=')
                    return {
                        key: this.cleanKey(key),
                        value: value.trim()
                    }
                })

                data.filter(d => d && ACCEPTED_PROPERTIES.indexOf(d.key) > -1)
                    .map(d => {
                        metadata.set(`video.${d.key}`, d.value)
                    })

                resolve(metadata)
            }).catch(error => {
                reject(error)
            })
        })
    }

    cleanKey(key:string):string {
        let newKey = key.replace('streams_stream_0_', '')
        if (newKey in REPLACE_PROPERTY_NAMES) {
            return REPLACE_PROPERTY_NAMES[newKey]
        }
        return newKey.replace(/_/g, '.')
    }

    accepts(file:StoredFile):boolean {
        return /(.+)\.(webm|mp4|mpg)/.test(file.filename)
    }
}
