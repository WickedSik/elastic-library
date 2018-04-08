import _ from 'lodash'

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
                results: [],
                errors: action.payload,
            }

        case ActionTypes.SEARCH_SUCCESS:
            return {
                ...state,
                results: action.payload,
            }

        case ActionTypes.SEARCH_SUCCESS_ADD:
            return {
                ...state,
                results: _.concat(state.results || [], action.payload),
            }

        case ActionTypes.SUBJECT_LIST_REQUEST:
            return {
                ...state,
                subjects: [],
                errors: [],
            }

        case ActionTypes.SUBJECT_LIST_FAILED:
            return {
                ...state,
                subjects: [],
                errors: action.payload,
            }

        case ActionTypes.SUBJECT_LIST_SUCCESS:
            return {
                ...state,
                subjects: action.payload,
            }

        case ActionTypes.FETCH_DOCUMENT_REQUEST:
            return {
                ...state,
                document: null
            }

        case ActionTypes.FETCH_DOCUMENT_FAILED:
            return {
                ...state,
                errors: action.payload
            }

        case ActionTypes.FETCH_DOCUMENT_SUCCESS:
            return {
                ...state,
                document: action.payload
            }

        default:
            return {
                ...state
            };
    }
}

export default search