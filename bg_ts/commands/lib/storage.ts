import path from 'path'
import { fs } from 'mz'
import chalk from 'chalk'
import { StoredFile } from '../declarations/files'
import Logger from './utils/logger'
import { timestamp } from './utils/visualize';

export default class Storage {
    directories:string[]

    constructor(dirs:string[]) {
        this.directories = dirs
    }

    read(directory:string, logger:Logger):Promise<StoredFile[]> {
        const foundFiles:StoredFile[] = []

        return new Promise((resolve, reject) => {
            fs.exists(directory)
                .then((exists:boolean) => {
                    if(!exists) {
                        return resolve([])
                    }

                    const files = this.recursive(directory)

                    for(const f of files) {
                        if(path.basename(f).substr(0, 1) === '.') {
                            continue
                        }

                        let [filename, ...dirparts] = Storage.normalize(f).split('/').reverse()
                        let dir = dirparts.reverse().slice(1).join('/')

                        foundFiles.push({
                            realpath: f,
                            directory: dir,
                            filename
                        })
                    }

                    logger.info(chalk`-- {magenta [%s]} %s: {yellow %s files}`, timestamp(), directory, foundFiles.length)

                    return resolve(foundFiles)
                    
                }).catch(error => reject(error))
        })
    }

    async readAll(logger:Logger):Promise<StoredFile[]> {
        const allFiles = await Promise.all(this.directories.map(directory => {
            return this.read(directory, logger)
        }))

        return allFiles.reduce((prev = [], data) => {
            return prev.concat(data)
        }).filter((value, index, array) => array.indexOf(value) === index)
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

    async exists(filepath:string):Promise<boolean> {
        return fs.exists(filepath.replace(/[\/\\]/g, path.sep))
    }

    static normalize(filepath:string):string {
        return filepath.toLowerCase().replace(/[\/\\]/g, '/').replace(/([a-z]):/g, '$1--')
    }

    static denormalize(filepath:string):string {
        return filepath.toLowerCase().replace(/[\/]/g, path.sep).replace(/[a-z]--/g, '$1:')
    }
}