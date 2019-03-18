import { Task } from '../process'
import Elastic from './lib/elastic'
import { Progressbar } from './lib/utils/progressbar'
import Logger from './lib/utils/logger'
import Queue from './lib/utils/queue';
import ThumbnailValidator from './lib/validators/ThumbnailValidator';

export interface Validator {
    run(client:Elastic, logger:Logger):Promise<any>
}

export default class Doctor implements Task {
    name:string = 'doctor'
    description:string = 'Checks and validates the elasticsearch database'

    private client:Elastic
    private progressbar:Progressbar
    private validators:Validator[] 

    constructor() {
        this.client = new Elastic()
        this.progressbar = new Progressbar()
        this.validators = [
            new ThumbnailValidator()
        ]
    }

    async run(parameters:any[], logger:Logger) {
        const queue = new Queue<any>()

        logger.info('starting')
        this.progressbar.createProgressbar('validators', this.validators.length)

        this.validators.forEach(validator => {
            queue.add(() => {
                this.progressbar.tick()
                return validator.run(this.client, logger)
            })
        })
        
        await queue.start()
        logger.info('finished')
    }
}