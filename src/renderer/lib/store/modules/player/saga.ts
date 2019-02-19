import { call, put, take } from 'redux-saga/effects'

export function* toggleMute() {
    yield put({ type: 'eslib/player/TOGGLE_MUTE_REQUEST' })
}

export function* playerWatcher() {
    while(true) {
        yield take('eslib/player/TOGGLE_MUTE_REQUEST')
        yield call(toggleMute)
    }
}