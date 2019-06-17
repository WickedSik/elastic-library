import { put, select, takeEvery } from 'redux-saga/effects'

import {
    TOGGLE_FULLSCREEN_REQUEST,
    TOGGLE_SCREENLOCK_REQUEST,
    TOGGLE_FULLSCREEN_SUCCESS,
    TOGGLE_SCREENLOCK_SUCCESS
} from './actiontypes'
import { dispatchAction } from '../index'

function* toggleFullscreen() {
    const locked = yield select(state => state.dialog.screenLock)

    if (!locked) {
        yield put(dispatchAction(TOGGLE_FULLSCREEN_SUCCESS))
    }
}

function* toggleScreenlock(actionObject) {
    yield put(dispatchAction(TOGGLE_SCREENLOCK_SUCCESS, actionObject.payload))
}

export default [
    takeEvery(TOGGLE_FULLSCREEN_REQUEST, toggleFullscreen),
    takeEvery(TOGGLE_SCREENLOCK_REQUEST, toggleScreenlock)
]
