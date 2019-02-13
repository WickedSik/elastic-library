import { Writable } from 'stream'
import Import from './commands/import'

export interface Task {
    name:string
    output:OutputStream
    run(parameters:any[]):Promise<any>
}

export class OutputStream extends Writable {
    buffer:Buffer

    constructor() {
        super()

        this.buffer = new Buffer('')
    }

    _write(chunk, enc, next):void {
        this.buffer.write(chunk, undefined, undefined, enc)
        next()
    }

    reset():void {
        this.buffer = new Buffer('')
    }

    toString():string {
        return this.buffer.toString()
    }
}

export default class Process {
    output:OutputStream
    commands:Task[]

    constructor() {
        // prepare commands

        this.output = new OutputStream
        this.commands = [
            new Import(this.output)
        ]
    }

    run(command:string, parameters:any[] = []):void {
        const c:Task = this.commands.find(c => c.name === command)

        console.info('-- running %s', command)

        if(c) {
            c.run(parameters).then(() => {
                console.log(this.output.toString())
            }).then(() => {
                process.exit(0)
            })
        }
    }
}

const p = new Process()
p.run(process.argv[2])