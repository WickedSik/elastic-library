export type QueueStatus<T> = {
    status: 'success' | 'failed'
    error?: any
    value?: T
}

type PromiseMaker<T> = () => Promise<T>

export default class Queue<T> {
    private promises:PromiseMaker<T>[]

    constructor() {
        this.promises = []
    }

    add(f:PromiseMaker<T>) {
        this.promises.push(f)
    }

    async start():Promise<(QueueStatus<T>)[]> {
        const results = []

        while(this.promises.length > 0) {
            let result:QueueStatus<T> = {
                status: 'failed'
            }

            try {
                result.value = await this.call()
                result.status = 'success'
            } catch(error) {
                result.error = error
            }

            results.push(result)
        }

        return results
    }

    private async call() {
        const promiseMaker = this.promises.shift()
        
        try {
            return await promiseMaker()
        } catch(error) {
            throw error
        }
    }
}
