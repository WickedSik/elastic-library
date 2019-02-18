import Process, { Task } from '../process'
import chalk from 'chalk'

export default class Help implements Task {
    name:string = 'help'
    process:Process

    constructor(process:Process) {
        this.process = process
    }

    run(parameters:any[]):Promise<any> {
        console.info(chalk`{yellow usage}: node bg/process.js {greenBright <command>} {magenta <arguments...>}`)
        console.info(chalk`{green Available commands:}`)

        this.process.commands.forEach((command:Task) => {
            if(command.name === this.name) {
                return
            }
            
            console.info(chalk`\t{greenBright %s} - {white %s}`, command.name, command.description)
        })

        return Promise.resolve()
    }
}