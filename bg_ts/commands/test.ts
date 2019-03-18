import chalk from 'chalk'

import { Task } from '../process'
import { StoredFile } from './declarations/files'
import Queue from './lib/utils/queue'
import Elastic from './lib/elastic'
import Cacher from './lib/cacher'
import Storage from './lib/storage'
import Logger from './lib/utils/logger'
import visualize, { timestamp } from './lib/utils/visualize'

export default class Test implements Task {
    name:string = 'test'
    description:string = 'A test command'

    private queue:Queue<StoredFile>
    private client:Elastic
    private filesystem:Storage
    private cacher:Cacher

    constructor() {
        this.queue = new Queue<StoredFile>()
        this.cacher = new Cacher('checksum')
        this.client = new Elastic()
        this.filesystem = new Storage([
            '/Volumes/BIGCAKES/Images',
            '/Volumes/BIGCAKES/Sets',
            '/Volumes/BIGCAKES/Videos',
            'E:\\Images',
            'E:\\Sets',
            'E:\\Videos',
            'D:\\Personal\\Videos'
        ])
    }

    async run(parameters:any[], logger:Logger) {
        const files = await this.files(logger)
        logger.info(chalk`-- {magenta [%s]} %d files`, timestamp(), files.length)

        visualize(logger, 'file 1', files[0])
    }

    async files(logger:Logger):Promise<StoredFile[]> {
        return this.filesystem.readAll(logger)
    }
}