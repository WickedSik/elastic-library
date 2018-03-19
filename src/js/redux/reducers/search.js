import * as ActionTypes from '../ActionTypes'

const search = (state, action) => {
    switch (action.type) {

        case ActionTypes.SEARCH_REQUEST:
            return {
                ...state,
                errors: [],
            }

        case ActionTypes.SEARCH_FAILED:
            return {
                ...state,
                errors: action.payload,
            }

        case ActionTypes.SEARCH_SUCCESS:
            return {
                ...state,
                results: action.payload,
            }

        case ActionTypes.SUBJECT_LIST_REQUEST:
            return {
                ...state,
                errors: [],
            }

        case ActionTypes.SUBJECT_LIST_FAILED:
            return {
                ...state,
                errors: action.payload,
            }

        case ActionTypes.SUBJECT_LIST_SUCCESS:
            return {
                ...state,
                subjects: action.payload,
            }

        default:
            return {
                ...state
            };
    }
}

export default search