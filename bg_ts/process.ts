import Import from './commands/import'
import Help from './commands/help'
import Meta from './commands/meta'
import Remote from './commands/remote'
import RemoteAll from './commands/remote-all'
import Doctor from './commands/doctor'
import Test from './commands/test'

import Logger, { LogLevel } from './commands/lib/utils/logger'
import chalk from 'chalk'

import config from '../config.json'

export interface Task {
    name:string
    description?:string
    run(parameters:any[], logger:Logger):Promise<any>
}

export interface ProcessOptions {
    logLevel: 'debug'
}

export default class Process {
    commands:Task[]
    options:ProcessOptions
    logger:Logger

    constructor(commands:Task[]) {
        // prepare commands
        this.commands = commands
        this.logger = new Logger()
    }

    async run(command:string, parameters:any[] = []):Promise<any> {
        const task:Task = this.commands.find(c => c.name === command)

        if(task) {
            await task.run(parameters.filter(p => (p !== '--loglevel') || (p as LogLevel)), this.logger)
            this.logger.info(chalk`\n{green command %s finished}\n`, command);
        } else {
            this.logger.error(chalk`\n{red command %s not found}\n`, command)

            await this.run('help')
        }
    }
}

const [_, __, command, ...parameters] = process.argv
const p = new Process([
    new Import(config),
    new Meta(config),
    new Remote(config),
    new RemoteAll(config),
    new Doctor(config),
    new Test(config)
])
p.commands.push(new Help(config, p))

if(parameters.indexOf('--loglevel') > -1) {
    const loglevel = parameters.splice(parameters.indexOf('--loglevel') + 1, 1)

    p.logger.info(chalk`{bold setting loglevel to:} %s`, loglevel)
    if(loglevel) {
        p.logger.level = loglevel[0] as LogLevel
    } else {
        throw `${loglevel} is not a valid option`
    }
}

p.run(command, parameters)
.then(() => {
    process.exit(0)
})
.catch(error => {
    p.logger.error(chalk`\n{red command %s failed}: %s`, command, error)
})