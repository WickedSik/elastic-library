import * as path from 'path'
import * as fs from 'fs'

export interface StoredFile {
    directory:string
    filename:string
    checksum?:string
}

export default class Storage {
    directories:string[]
    files:StoredFile[]

    constructor(dirs:string[]) {
        this.directories = dirs
        this.files = []
    }

    read(directory:string):Promise<StoredFile[]> {
        return new Promise((resolve, reject) => {
            const files = this.recursive(directory)

            for(const f of files) {
                if(path.basename(f).substr(0, 1) === '.') {
                    continue
                }

                let filename = f.replace(directory, '').substr(1)

                this.files.push({ directory, filename })
            }

            return resolve(this.files)
        })
    }

    readAll():Promise<StoredFile[]> {
        return Promise.all(this.directories.map(directory => {
            return this.read(directory)
        })).then((allFiles:StoredFile[][]) => {
            return allFiles.reduce((prev = [], data) => {
                return prev.concat(data)
            }).filter((value, index, array) => array.indexOf(value) === index)
        })
    }

    recursive(directory:string):string[] {
        const walkSync = (dir:string, filelist:string[] = []) => {
            fs.readdirSync(dir).forEach(file => {
                filelist = fs.statSync(path.join(dir, file)).isDirectory()
                    ? walkSync(path.join(dir, file), filelist)
                    : filelist.concat(path.join(dir, file))
            })
            return filelist
        }

        return walkSync(directory)
    }
}