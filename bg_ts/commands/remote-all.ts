import chalk from 'chalk'
import Process, { Task } from '../process'
import Elastic from './lib/elastic'
import { timestamp } from './lib/utils/visualize'
import Remote from './remote'
import Logger from './lib/utils/logger'

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
        this.process.logger.level = 'error'
    }

    async run(parameters:string[], logger:Logger):Promise<any> {
        type Sum = {
            id: string
            checksum: string
            file: {
                path: string
            }
        }

        const filterQuery:any = {
            bool: {
                must_not: [
                    {
                        term: {
                            'keywords.keyword': {
                                value: 'checked_on_booru'
                            }
                        }
                    }
                ]
            }
        }

        if (parameters.length > 0) {
            filterQuery.bool.must = [
                {
                    term: {
                        'keywords.keyword': {
                            value: parameters.join(' ')
                        }
                    }
                }
            ]
        }

        const checksums:Sum[] = await this.checksums(filterQuery)

        logger.info(chalk`-- {magenta [%s]} %d checksums %s`, timestamp(), checksums.length, parameters.length === 0 ? '' : `for ${parameters.join(' ')}`)

        for(let i = 0; i < checksums.length; i++) {
            const sum:Sum = checksums[i]

            if(!sum.file || !sum.file.path) {
                logger.warning(chalk`-- {magenta [%s]} {yellow [%d/%d]} Checksum {green 'media/media/%s'} does not have a file; {red deleting}`, timestamp(), i, checksums.length, sum.id)

                await this.client.delete(sum.id)
                continue
            }

            try {
                logger.info(chalk`-- {magenta [%s]} {yellow [%d/%d]} Running file %s`, timestamp(), i, checksums.length, sum.file.path)
                await this.process.run('remote', [
                    sum.file.path
                ])
            } catch(error) {
                logger.error(chalk`-- {magenta [%s]} {yellow [%d/%d]} Failed for file %s`, timestamp(), i, checksums.length, sum.file.path)
            }
        }
    }

    async checksums(excludes:any):Promise<any[]> {
        return this.client.getSummary(['checksum', 'file.path'], excludes)
    }
}