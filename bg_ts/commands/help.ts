import chalk from 'chalk'
import Process, { Task } from '../process'
import Logger from './lib/utils/logger'
import { ConfigJSON } from './declarations/config'

export default class Help implements Task {
    name:string = 'help'
    process:Process

    constructor(config:ConfigJSON, process:Process) {
        this.process = process
    }

    run(parameters:any[], logger:Logger):Promise<any> {
        logger.info(chalk`{yellow usage}: node bg/process.js {greenBright <command>} {magenta <arguments...>}`)
        logger.info(chalk`{green Available commands:}`)

        this.process.commands.forEach((command:Task) => {
            if(command.name === this.name) {
                return
            }
            
            logger.info(chalk`\t{greenBright %s} - {white %s}`, command.name, command.description)
        })

        return Promise.resolve()
    }
}