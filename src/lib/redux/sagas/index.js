import { all } from 'redux-saga/effects'

import searchWatches from './search'

export function action(type, payload) {
    return { type, payload }
}

export default function* rootSaga() {
    yield all([
        ...searchWatches
    ])
}
