import { put, takeEvery } from 'redux-saga/effects'

import {
    TOGGLE_MUTE_REQUEST,
    TOGGLE_MUTE_SUCCESS
} from './actiontypes'
import { dispatchAction } from '../index'

function* toggleMute() {
    yield put(dispatchAction(TOGGLE_MUTE_SUCCESS))
}

export default [
    takeEvery(TOGGLE_MUTE_REQUEST, toggleMute)
]
