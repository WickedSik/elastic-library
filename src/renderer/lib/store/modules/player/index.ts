import saga from './saga'
import { Action } from 'redux'

import {
    TOGGLE_MUTE_SUCCESS
} from './actiontypes'

export type PlayerState = {
    readonly muted: boolean
}

export const initialState:PlayerState = {
    muted: true
}

export default (state:PlayerState = initialState, action:Action) => {
    console.info('-- reduce', action.type)
    console.groupEnd()
    switch (action.type) {
        case TOGGLE_MUTE_SUCCESS:
            return {
                ...state,
                muted: !state.muted
            }

        default:
            return {
                ...state
            }
    }
}

export { saga }
