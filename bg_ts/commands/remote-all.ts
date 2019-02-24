import chalk from 'chalk'
import Process, { Task } from '../process'
import Elastic from './lib/elastic'
import { timestamp } from './lib/utils/visualize'
import Remote from './remote'

export default class RemoteAll implements Task {
    name:string = 'remote-all'
    description:string = 'Parses and checks remote sites for metadata for all unknown files'

    client:Elastic
    process:Process

    constructor() {
        this.client = new Elastic()
        this.process = new Process([
            new Remote()
        ])
    }

    async run(parameters:string[]):Promise<any> {
        type Sum = {
            id: string
            checksum: string
            file: {
                path: string
            }
        }

        const checksums:Sum[] = await this.checksums({
            query_string: {
                default_field: 'keywords',
                query: '-checked_on_e621'
            }
        })

        console.info(chalk`-- {magenta [%s]} %d checksums`, timestamp(), checksums.length)

        for(let i = 0; i < checksums.length; i++) {
            const sum:Sum = checksums[i]

            if(!sum.file || !sum.file.path) {
                console.warn(chalk`-- {magenta [%s]} Checksum {green 'media/media/%s'} does not have a file; {red deleting}`, timestamp(), sum.id)

                await this.client.delete(sum.id)
                continue
            }

            try {
                console.info(chalk`-- {magenta [%s]} Running file %s`, timestamp(), sum.file.path)
                await this.process.run('remote', [
                    sum.file.path
                ])
            } catch(error) {
                console.error(chalk`-- {magenta [%s]} Failed for file %s`, timestamp(), sum)
            }
        }
    }

    async checksums(excludes:any):Promise<any[]> {
        return this.client.getSummary(['checksum', 'file.path'], excludes)
    }
}