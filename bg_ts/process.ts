import Import from './commands/import'
import Help from './commands/help'
import Meta from './commands/meta'
import Remote from './commands/remote'

import chalk from 'chalk'

export interface Task {
    name:string
    description?:string
    run(parameters:any[]):Promise<any>
}

export default class Process {
    commands:Task[]

    constructor() {
        // prepare commands
        this.commands = [
            new Import(),
            new Meta(),
            new Remote(),
            new Help(this)
        ]
    }

    run(command:string, parameters:any[] = []):void {
        const task:Task = this.commands.find(c => c.name === command)

        if(task) {
            task.run(parameters).then(() => {
                process.exit(0)
            })
        } else {
            console.error(chalk`{red command %s not found}`, command)
        }
    }
}

const [_, __, command, ...parameters] = process.argv
const p = new Process()
p.run(command, parameters)