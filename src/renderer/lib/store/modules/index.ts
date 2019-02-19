import { all } from 'redux-saga/effects'
import { AnyAction } from 'redux'

import { saga as searchSaga, default as searchReducer } from './search'
import { saga as playerSaga, default as playerReducer } from './player'

export const reducers = {
    search: searchReducer,
    player: playerReducer
}

export default reducers

export function* rootSaga() {
    yield all([
        ...searchSaga,
        ...playerSaga
    ])
}

export function action(module:string, name:string):string {
    console.info('-- action', `es-lib/${module}/${name}`)
    return `es-lib/${module}/${name}`
}

export function dispatchAction(type:string, payload?:any):AnyAction {
    console.group('-- dispatch', type)
    console.info('-- dispatch', type, { payload })
    return {
        type,
        payload
    }
}

export const handleError = (err:any) => {
    console.info('-- handle:error', err)

    if (err.message && !err.response) {
        return {
            status: 'error',
            message: err.message
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
