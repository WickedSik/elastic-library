import { combineReducers } from 'redux'

import search from './search'

const reducers = {
    search
}

export default (state, action) => {
    if (action.type === 'GLOBAL_STATE_RESET') {
        state = undefined
    }

    return combineReducers(reducers)(state, action)
}
