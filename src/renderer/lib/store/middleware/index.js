export const crashReporter = store => next => action => {
    try {
        return next(action)
    } catch (error) {
        console.error('Caught exception', error)
        throw error
    }
}

export const logger = store => next => action => {
    console.group(action.type)
    console.info('dispatching', action)

    let result = next(action)

    console.log('next state', store.getState())
    console.groupEnd()

    return result
}

export const thunk = store => next => action =>
    typeof action === 'function'
        ? action(store.dispatch, store.getState)
        : next(action)
