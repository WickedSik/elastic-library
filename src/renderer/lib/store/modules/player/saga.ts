import { put, takeEvery } from 'redux-saga/effects'

export function* toggleMute() {
    yield put({ type: 'eslib/player/TOGGLE_MUTE_SUCCESS' })
}

export function* playerWatcher() {
    yield takeEvery('eslib/player/TOGGLE_MUTE_REQUEST', toggleMute)
}