export type LogLevel = 'debug' | 'info' | 'warning' | 'error'

export default class Logger {
    level:LogLevel = 'debug'

    private isAcceptedLevel(level:LogLevel):boolean {
        if(this.level === 'debug') {
            return true
        }
        if(this.level === 'info' && level !== 'debug') {
            return true
        }
        if(this.level === 'warning' && (level === 'warning' || level === 'error')) {
            return true
        }
        return this.level === 'error' && level === 'error'
    }

    debug(...arg:any[]):void {
        this.isAcceptedLevel('debug') && console.log(...arg)
    }

    info(...arg:any[]):void {
        this.isAcceptedLevel('info') && console.info(...arg)
    }

    warning(...arg:any[]):void {
        this.isAcceptedLevel('warning') && console.warn(...arg)
    }

    error(...arg:any[]):void {
        this.isAcceptedLevel('error') && console.error(...arg)
    }
}