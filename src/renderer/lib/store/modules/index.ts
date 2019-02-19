import { combineReducers } from 'redux-immutable'

import { SearchState, searchReducer, initialState as searchState } from './search'
import { PlayerState, playerReducer, initialState as playerState } from './player'

import { searchWatcher } from './search/saga'
import { playerWatcher } from './player/saga'

export function* rootSaga() {
    yield [
        searchWatcher(),
        playerWatcher()
    ]
}

export interface RootState {
    search:SearchState
    player:PlayerState
}

export const initialState:RootState = {
    player: playerState,
    search: searchState
}

export const state = combineReducers({
    player: playerReducer,
    search: searchReducer
})
