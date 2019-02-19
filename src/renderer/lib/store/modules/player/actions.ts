import { Action } from 'redux'

export interface IActionPlayerToggleMuteRequest extends Action {
    type: 'eslib/player/TOGGLE_MUTE_REQUEST'
    payload: {
        muted: boolean
    }
}

export interface IActionPlayerToggleMuteSuccess extends Action {
    type: 'eslib/player/TOGGLE_MUTE_SUCCESS'
    payload: {
        muted: boolean
    }
}

export type PlayerActions = IActionPlayerToggleMuteRequest | IActionPlayerToggleMuteSuccess
