import saga from './saga'

import {
    TOGGLE_FULLSCREEN_SUCCESS,
    TOGGLE_SCREENLOCK_SUCCESS
} from './actiontypes'

const initialState = {
    fullscreen: false,
    screenLock: false
}

export default (state = initialState, action) => {
    console.info('-- dialog:reduce', action.type)
    console.groupEnd()
    switch (action.type) {
        case TOGGLE_FULLSCREEN_SUCCESS:
            return {
                ...state,
                fullscreen: !state.fullscreen
            }

        case TOGGLE_SCREENLOCK_SUCCESS:
            return {
                ...state,
                screenLock: action.payload
            }

        default:
            return {
                ...state
            }
    }
}

export { saga }
