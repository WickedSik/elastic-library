import { all } from 'redux-saga/effects'

import { saga as searchSaga, default as searchReducer } from './search'

export const reducers = {
    search: searchReducer
}

export default reducers

export function* rootSaga() {
    yield all([
        ...searchSaga
    ])
}

export function action(module, name) {
    console.info('-- action', `es-lib/${module}/${name}`)
    return `es-lib/${module}/${name}`
}

export function dispatchAction(type, payload) {
    console.group('-- dispatch', type)
    console.info('-- dispatch', type, { payload })
    return {
        type,
        payload
    }
}

export const handleError = err => {
    console.info('-- handle:error', err)

    if (err.message && !err.response) {
        return {
            status: 'error',
            message: err.message
        }
    } else if (err.response.status === 422) {
        const errors = err.body.errors
        const messages = []

        Object.keys(errors).forEach(x => errors[x].forEach(y => messages.push(y)))

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
