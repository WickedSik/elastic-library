const exec = require('mz/child_process').execFile
const _ = require('lodash')
const Parser = require('./base/parser')

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

class VideoParser extends Parser {
    parse(metadata) {
        return new Promise(resolve => {
            // ffprobe -v error -of flat=s=_ -select_streams v:0 -show_entries stream
            exec('ffprobe', [
                '-v', 'error',
                '-of', 'flat=s=_',
                '-select_streams', 'v:0',
                '-show_entries', 'stream',
                metadata.getFilePath()
            ])
                .then(out => {
                    const stdout = out[0].toString('utf8')
                    //   'streams_stream_0_tags_handler_name="VideoHandler"',
                    const lines = stdout.split('\n')

                    const data = lines.map(curr => {
                        if (curr.length === 0) {
                            return undefined
                        }
                        const [key, value] = curr.split('=')
                        return {
                            key: this.cleanKey(key),
                            value: _.trim(value, '"')
                        }
                    })

                    data.filter(d => d && ACCEPTED_PROPERTIES.indexOf(d.key) > -1)
                        .map(d => {
                            metadata.set(`video.${d.key}`, d.value)
                        })
                    resolve(metadata)
                })
                .catch(e => {
                    resolve()
                })
        })
    }

    get mapping() {
        return {
            image: {
                type: 'object',
                properties: {
                    width: { type: 'integer' },
                    height: { type: 'integer' },
                    title: { type: 'text' },
                    aspect: { type: 'text' },
                    framerate: { type: 'text' },
                    encoder: { type: 'text' },
                    duration: { type: 'double' }
                }
            }
        }
    }

    accepts(file) {
        return /(.+)\.(webm|mp4|mpg)/.test(file)
    }

    cleanKey(key) {
        let newKey = key.replace('streams_stream_0_', '')
        if (newKey in REPLACE_PROPERTY_NAMES) {
            return REPLACE_PROPERTY_NAMES[newKey]
        }
        return newKey.replace(/_/g, '.')
    }
}

module.exports = VideoParser
