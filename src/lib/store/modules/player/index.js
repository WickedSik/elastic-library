import saga from './saga'

import {
    TOGGLE_MUTE_SUCCESS
} from './actiontypes'

const initialState = {
    muted: true
}

export default (state = initialState, action) => {
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
