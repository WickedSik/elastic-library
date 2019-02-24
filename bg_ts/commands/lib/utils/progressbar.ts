import ProgressBar from 'progress'
import chalk from 'chalk'
import { timestamp } from './visualize'

export class Progressbar {
    progressbar:ProgressBar

    createProgressbar(label:string, total:number):void {
        if(this.progressbar) {
            // NOTE(jurrien) set completion to 100%
            this.progressbar.update(1)
        }

        this.progressbar = new ProgressBar(chalk`-- {magenta [${timestamp()}]} ${label} [:bar] :percent :etas (:rate/s)`, {
            complete: '=',
            incomplete: ' ',
            width: 120,
            total: total,
            callback: () => {
                this.progressbar = null
            }
        })
    }

    tick() {
        if(this.progressbar) {
            this.progressbar.tick()
        }
    }
}
