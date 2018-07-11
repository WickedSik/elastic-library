const Exif = require('exif')

class ExifParser {
    validate(value) {
        if (value instanceof Buffer) {
            return value.toString('utf8')
        } else if (value instanceof Array) {
            let primitive = true
            value.forEach((v, k) => {
                if (v instanceof Object || v instanceof Array) {
                    primitive = false
                }

                value[k] = this.validate(v)
            })

            if (primitive) {
                value = value.join('')
            }
        } else if (value instanceof Object) {
            for (const key of Object.keys(value)) {
                value[key] = this.validate(value[key])
            }
        }
        return value
    }

    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {
            new Exif({ // eslint-disable-line no-new
                image: metadata.getFilePath()
            }, (error, data) => {
                if (error) {
                    if (error.code === 'NO_EXIF_SEGMENT' || error.code === 'NOT_A_JPEG') {
                        resolve()
                    } else {
                        reject(error)
                    }
                } else {
                    metadata.set('exif', this.validate(data))

                    resolve()
                }
            })
        })
    }

    get mapping() {
        return {
            exif: {
                type: 'object'
            }
        }
    }
}

module.exports = ExifParser
