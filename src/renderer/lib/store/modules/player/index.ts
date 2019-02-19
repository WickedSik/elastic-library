import { PlayerActions } from './actions'
import { PlayerState } from './design'

export const initialState:PlayerState = {
    muted: true
}

export type PlayerState = PlayerState

export function playerReducer(state: PlayerState = initialState, action: PlayerActions):PlayerState {
    if(action.type === 'eslib/player/TOGGLE_MUTE_SUCCESS') {
        return {
            muted: action.payload.muted
        }
    }

    return state
}
