import { Action } from 'redux'

export interface IActionPlayerToggleMuteRequest extends Action {
    type: 'eslib/player/TOGGLE_MUTE_REQUEST'
}

export interface IActionPlayerToggleMuteSuccess extends Action {
    type: 'eslib/player/TOGGLE_MUTE_SUCCESS'
}

export type PlayerActions = IActionPlayerToggleMuteRequest | IActionPlayerToggleMuteSuccess
