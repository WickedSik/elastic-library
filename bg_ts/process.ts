import { Writable } from 'stream'
import Import from './commands/import'

export interface Task {
    name:string
    run(parameters:any[]):Promise<any>
}

export default class Process {
    commands:Task[]

    constructor() {
        // prepare commands
        this.commands = [
            new Import()
        ]
    }

    run(command:string, parameters:any[] = []):void {
        const task:Task = this.commands.find(c => c.name === command)

        console.info('-- running command: %s', command)

        if(task) {
            task.run(parameters).then(() => {
                process.exit(0)
            })
        }
    }
}

const p = new Process()
p.run(process.argv[2])