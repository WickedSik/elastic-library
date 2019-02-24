import Import from './commands/import'
import Help from './commands/help'
import Meta from './commands/meta'
import Remote from './commands/remote'
import RemoteAll from './commands/remote-all'

import chalk from 'chalk'

export interface Task {
    name:string
    description?:string
    run(parameters:any[]):Promise<any>
}

export default class Process {
    commands:Task[]

    constructor(commands:Task[]) {
        // prepare commands
        this.commands = commands
    }

    async run(command:string, parameters:any[] = []):Promise<any> {
        const task:Task = this.commands.find(c => c.name === command)

        if(task) {
            await task.run(parameters);
            console.info(chalk`\n{green command %s finished}`, command);
        } else {
            console.error(chalk`\n{red command %s not found}`, command)
        }
    }
}

const [_, __, command, ...parameters] = process.argv
const p = new Process([
    new Import(),
    new Meta(),
    new Remote(),
    new RemoteAll()
])
p.commands.push(new Help(p))
p.run(command, parameters)
.then(() => {
    process.exit(0)
})
.catch(error => {
    console.error(chalk`\n{red command %s failed}: %s`, command, error)
})