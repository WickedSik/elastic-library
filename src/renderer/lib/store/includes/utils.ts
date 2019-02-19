export interface HandledError {
    status: string
    response?: Response
    original?: any
    messages: any[]
}

export const handleError = (err:any):HandledError => {
    console.info('-- handle:error', err)

    if (err.message && !err.response) {
        return {
            status: 'error',
            messages: [ err.message ]
        }
    } else if (err.response.status === 422) {
        const errors = err.body.errors
        const messages:string[] = []

        Object.keys(errors).forEach(x => errors[x].forEach((y:string) => messages.push(y)))

        return {
            status: 'error',
            response: err.response,
            original: errors,
            messages
        }
    } else if (err.response.status === 400) {
        return {
            status: 'error',
            response: err.response,
            original: err,
            messages: ['Something went wrong, please try again later.']
        }
    } else {
        return {
            status: 'error',
            response: err.response,
            original: err,
            messages: ['Something went wrong, please try again later. ' + (err.body.hasOwnProperty('debug') && err.body.debug.message ? err.body.debug.message : '')]
        }
    }
}
